
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, balanced_accuracy_score
from sklearn.model_selection import train_test_split
import xgboost as xgb
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier

# === Загрузка данных ===
with open("dataset_train.json", encoding="utf-8") as f:
    dataset_train = json.load(f)
with open("data.json", encoding="utf-8") as f:
    dataset_test_unlabeled = json.load(f)
with open("dataset_test.json", encoding="utf-8") as f:
    dataset_test = json.load(f)

# === Обработка ===
def flatten_dataset(data, include_target=True):
    records = []
    for entry in data:
        flat = {
            "roomsCount": entry.get("roomsCount", 0),
            "residentsCount": entry.get("residentsCount", 0),
            "totalArea": entry.get("totalArea", np.nan),
            "buildingType": entry.get("buildingType", "NA"),
        }
        if include_target:
            flat["isCommercial"] = entry.get("isCommercial", None)

        consumption = entry.get("consumption", {})
        month_values = {m: consumption.get(str(m), 0) for m in range(1, 13)}

        summer = [month_values[m] for m in [6, 7, 8]]
        winter = [month_values[m] for m in [12, 1, 2]]
        all_vals = list(month_values.values())

        flat["summer_mean"] = np.mean(summer)
        flat["summer_sum"] = np.sum(summer)
        flat["summer_weighted_avg"] = np.average(summer, weights=[1, 1, 2, 2, 1])
        flat["winter_mean_consumption"] = np.mean(winter)
        flat["high_winter_consumption"] = int(flat["winter_mean_consumption"] > 3000)
        flat["consumption_mean"] = np.mean(all_vals)
        flat["consumption_std"] = np.std(all_vals)
        flat["consumption_median"] = np.median(all_vals)
        flat["consumption_sum_summer"] = sum([month_values[m] for m in [6, 7, 8]])
        flat["consumption_sum_winter"] = sum([month_values[m] for m in [12, 1, 2]])
        flat["std_summer"] = np.std(summer)
        flat["std_winter"] = np.std(winter)
        flat["zero_month_ratio"] = sum(1 for v in all_vals if v == 0) / 12
        flat["area_per_person"] = flat["totalArea"] / (flat["residentsCount"] + 0.1) if pd.notnull(flat["totalArea"]) else np.nan
        flat["log_area_per_person"] = np.log1p(flat["area_per_person"]) if pd.notnull(flat["area_per_person"]) else np.nan
        flat["log_totalArea"] = np.log1p(flat["totalArea"]) if pd.notnull(flat["totalArea"]) else np.nan
        flat["population_density"] = (flat["residentsCount"] + 0.1) / (flat["totalArea"] + 0.1)

        for m in [1, 2, 3, 4, 10, 11, 12]:
            flat[f"c_{m}"] = month_values[m]

        flat["accountId"] = entry.get("accountId")
        flat["address"] = entry.get("address", "")
        records.append(flat)
    return pd.DataFrame(records)

df_train = flatten_dataset(dataset_train, include_target=True)
df_test_unlabeled = flatten_dataset(dataset_test_unlabeled, include_target=False)
df_test_labeled = flatten_dataset(dataset_test, include_target=True)

all_types = pd.concat([df_train["buildingType"], df_test_unlabeled["buildingType"], df_test_labeled["buildingType"]])
all_types, _ = pd.factorize(all_types)

df_train["buildingType"] = all_types[:len(df_train)]
df_test_unlabeled["buildingType"] = all_types[len(df_train):len(df_train)+len(df_test_unlabeled)]
df_test_labeled["buildingType"] = all_types[len(df_train)+len(df_test_unlabeled):]

X_train = df_train.drop(columns=["isCommercial", "accountId", "address"])
y_train = df_train["isCommercial"]
X_test_final = df_test_labeled.drop(columns=["isCommercial", "accountId", "address"])
y_test_final = df_test_labeled["isCommercial"]
X_unlabeled = df_test_unlabeled.drop(columns=["accountId", "address"])

imputer = SimpleImputer(strategy="median")
X_train = imputer.fit_transform(X_train)
X_test_final = imputer.transform(X_test_final)
X_unlabeled = imputer.transform(X_unlabeled)

# === Обучение всех моделей ===
xgb_model = xgb.XGBClassifier(
    max_depth=4, learning_rate=0.1, n_estimators=300, subsample=0.6,
    colsample_bytree=0.8, use_label_encoder=False, eval_metric="logloss"
)
xgb_model.fit(X_train, y_train)

cat_model = CatBoostClassifier(iterations=300, depth=4, learning_rate=0.1, verbose=0)
cat_model.fit(X_train, y_train)

lgb_model = LGBMClassifier(n_estimators=300, max_depth=4, learning_rate=0.1)
lgb_model.fit(X_train, y_train)

# === Усреднение предсказаний ===
xgb_probs = xgb_model.predict_proba(X_test_final)[:, 1]
cat_probs = cat_model.predict_proba(X_test_final)[:, 1]
lgb_probs = lgb_model.predict_proba(X_test_final)[:, 1]

ensemble_proba = (xgb_probs + cat_probs + lgb_probs) / 3
ensemble_pred = (ensemble_proba > 0.54).astype(int)

# === Оценка ===
print("=== Classification Report (Ensemble) ===")
print(classification_report(y_test_final, ensemble_pred))
print(f"✅ Balanced Accuracy: {balanced_accuracy_score(y_test_final, ensemble_pred):.4f}")

# === Предсказания для неразмеченных данных ===
xgb_unlab = xgb_model.predict_proba(X_unlabeled)[:, 1]
cat_unlab = cat_model.predict_proba(X_unlabeled)[:, 1]
lgb_unlab = lgb_model.predict_proba(X_unlabeled)[:, 1]
ensemble_unlab = (xgb_unlab + cat_unlab + lgb_unlab) / 3

df_test_unlabeled["isCommercial"] = (ensemble_unlab > 0.54).astype(bool)
df_test_unlabeled["probability_isCommercial"] = ensemble_unlab

df_sorted = df_test_unlabeled.sort_values(by="probability_isCommercial", ascending=False)
export_fields = ["accountId", "probability_isCommercial", "isCommercial"]
export_data = df_sorted[export_fields].to_dict(orient="records")
for i in export_data:
    for j,m in enumerate(dataset_test_unlabeled):
        if(i["accountId"] == m["accountId"]):
            dataset_test_unlabeled[j]["isCommercial"] = i["isCommercial"]
            dataset_test_unlabeled[j]["probability_isCommercial"] = i["probability_isCommercial"]
sorted_data = sorted(dataset_test_unlabeled, key=lambda x: x["probability_isCommercial"], reverse = True)
with open("sorted_predictions_ensemble.json", "w", encoding="utf-8") as f:
    json.dump(sorted_data, f, ensure_ascii=False, indent=2)

print("📂 Предсказания сохранены в sorted_predictions_ensemble.json")
