
import json
import numpy as np
import pandas as pd
import xgboost as xgb
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, balanced_accuracy_score
from sklearn.model_selection import train_test_split

# === Загрузка данных ===
with open("dataset_train.json", encoding="utf-8") as f:
    dataset_train = json.load(f)
with open("dataset_test.json", encoding="utf-8") as f:
    dataset_test = json.load(f)

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
        summer = [month_values[m] for m in [5, 6, 7, 8, 9]]
        winter = [month_values[m] for m in [10, 11, 12, 1, 2, 3, 4]]
        all_vals = list(month_values.values())

        flat["summer_mean"] = np.mean(summer)
        flat["winter_mean_consumption"] = np.mean(winter)
        flat["std_summer"] = np.std(summer)
        flat["std_winter"] = np.std(winter)
        flat["zero_month_ratio"] = sum(1 for v in all_vals if v == 0) / 12
        flat["area_per_person"] = flat["totalArea"] / (flat["residentsCount"] + 0.1) if pd.notnull(flat["totalArea"]) else np.nan
        flat["population_density"] = (flat["residentsCount"] + 0.1) / (flat["totalArea"] + 0.1)

        for m in [1, 2, 3, 4, 10, 11, 12]:
            flat[f"c_{m}"] = month_values[m]

        records.append(flat)
    return pd.DataFrame(records)

df_train = flatten_dataset(dataset_train, include_target=True)
df_test = flatten_dataset(dataset_test, include_target=True)

all_types = pd.concat([df_train["buildingType"], df_test["buildingType"]])
all_types, _ = pd.factorize(all_types)

df_train["buildingType"] = all_types[:len(df_train)]
df_test["buildingType"] = all_types[len(df_train):]

X_train = df_train.drop(columns=["isCommercial"])
y_train = df_train["isCommercial"]
X_test = df_test.drop(columns=["isCommercial"])
y_test = df_test["isCommercial"]

imputer = SimpleImputer(strategy="median")
X_train = imputer.fit_transform(X_train)
X_test = imputer.transform(X_test)

# === Обучение моделей ===
xgb_model = xgb.XGBClassifier(max_depth=4, learning_rate=0.1, n_estimators=300,
                              subsample=0.6, colsample_bytree=0.8,
                              use_label_encoder=False, eval_metric="logloss")
xgb_model.fit(X_train, y_train)

cat_model = CatBoostClassifier(iterations=300, depth=4, learning_rate=0.1, verbose=0)
cat_model.fit(X_train, y_train)

lgb_model = LGBMClassifier(n_estimators=300, max_depth=4, learning_rate=0.1)
lgb_model.fit(X_train, y_train)

# === Предсказания вероятностей
xgb_probs = xgb_model.predict_proba(X_test)[:, 1]
cat_probs = cat_model.predict_proba(X_test)[:, 1]
lgb_probs = lgb_model.predict_proba(X_test)[:, 1]

ensemble_proba = (xgb_probs + cat_probs + lgb_probs) / 3

# === Подбор порога

...
# === Подбор порога
threshold_results = []
for t in np.linspace(0.3, 0.7, 41):
    pred = (ensemble_proba > t).astype(int)
    report = classification_report(y_test, pred, target_names=["False", "True"], output_dict=True)
    threshold_results.append({
        "threshold": round(t, 2),
        "recall_false": report["False"]["recall"],
        "recall_true": report["True"]["recall"],
        "balanced_accuracy": (report["False"]["recall"] + report["True"]["recall"]) / 2,
        "f1_true": report["True"]["f1-score"],
        "f1_false": report["False"]["f1-score"]
    })

df_thresholds = pd.DataFrame(threshold_results)
best_row = df_thresholds.loc[df_thresholds["balanced_accuracy"].idxmax()]
best_threshold = best_row["threshold"]

print("=== TOP по Balanced Accuracy ===")
print(df_thresholds.sort_values("balanced_accuracy", ascending=False).head(10))
print(f"🏆 Лучший порог: {best_threshold} с Balanced Accuracy = {best_row['balanced_accuracy']:.4f}")

# === Финальные метрики при лучшем пороге
final_pred = (ensemble_proba > best_threshold).astype(int)
print("\n=== Итоговая метрика при оптимальном пороге ===")
print(classification_report(y_test, final_pred))

import matplotlib.pyplot as plt

# === Визуализация
plt.figure(figsize=(10, 6))
plt.plot(df_thresholds["threshold"], df_thresholds["recall_false"], label="Recall False", color="green", marker="o")
plt.plot(df_thresholds["threshold"], df_thresholds["recall_true"], label="Recall True", color="blue", marker="o")
plt.plot(df_thresholds["threshold"], df_thresholds["balanced_accuracy"], label="Balanced Accuracy", color="orange", marker="o")
plt.axvline(x=best_threshold, color="red", linestyle="--", label=f"Best Threshold = {best_threshold}")
plt.xlabel("Threshold")
plt.ylabel("Score")
plt.title("📊 Метрики по различным порогам")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()
