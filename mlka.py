import json
import numpy as np
import pandas as pd
import xgboost as xgb
from catboost import CatBoostClassifier
from lightgbm import LGBMClassifier
from sklearn.impute import SimpleImputer
import joblib

# === Загрузка данных ===
with open("dataset_train.json", encoding="utf-8") as f:
    dataset_train = json.load(f)

def flatten_dataset(data):
    records = []
    for entry in data:
        flat = {
            "roomsCount": entry.get("roomsCount", 0),
            "residentsCount": entry.get("residentsCount", 0),
            "totalArea": entry.get("totalArea", np.nan),
            "buildingType": entry.get("buildingType", "NA"),
            "isCommercial": entry.get("isCommercial", None)
        }

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

df_train = flatten_dataset(dataset_train)

# Кодирование категориального признака
df_train["buildingType"], _ = pd.factorize(df_train["buildingType"])

# Отделяем целевую переменную
X = df_train.drop(columns=["isCommercial"])
y = df_train["isCommercial"]

# Импутация пропусков
imputer = SimpleImputer(strategy="median")
X_imputed = imputer.fit_transform(X)

# Обучение моделей
xgb_model = xgb.XGBClassifier(max_depth=4, learning_rate=0.1, n_estimators=300,
                              subsample=0.6, colsample_bytree=0.8,
                              use_label_encoder=False, eval_metric="logloss")
cat_model = CatBoostClassifier(iterations=300, depth=4, learning_rate=0.1, verbose=0)
lgb_model = LGBMClassifier(n_estimators=300, max_depth=4, learning_rate=0.1)

xgb_model.fit(X_imputed, y)
cat_model.fit(X_imputed, y)
lgb_model.fit(X_imputed, y)

# Сохраняем всё необходимое
joblib.dump(imputer, "imputer.pkl")
joblib.dump(xgb_model, "xgb_model.pkl")
joblib.dump(cat_model, "cat_model.pkl")
joblib.dump(lgb_model, "lgb_model.pkl")