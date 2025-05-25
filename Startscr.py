import json
import numpy as np
import pandas as pd
import joblib

# Загрузка сохранённых моделей и импутера
imputer = joblib.load("imputer.pkl")
xgb_model = joblib.load("xgb_model.pkl")
cat_model = joblib.load("cat_model.pkl")
lgb_model = joblib.load("lgb_model.pkl")

# Загрузка данных
with open("dataset_control.json", encoding="utf-8") as f:
    dataset_control = json.load(f)

def flatten_dataset(data):
    records = []
    for entry in data:
        flat = {
            "roomsCount": entry.get("roomsCount", 0),
            "residentsCount": entry.get("residentsCount", 0),
            "totalArea": entry.get("totalArea", np.nan),
            "buildingType": entry.get("buildingType", "NA"),
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

df_control = flatten_dataset(dataset_control)

# Кодирование buildingType (в той же последовательности, что и при обучении)
df_control["buildingType"], _ = pd.factorize(df_control["buildingType"])

# Импутация
X_control = imputer.transform(df_control)

# Предсказания
xgb_probs = xgb_model.predict_proba(X_control)[:, 1]
cat_probs = cat_model.predict_proba(X_control)[:, 1]
lgb_probs = lgb_model.predict_proba(X_control)[:, 1]

ensemble_probs = (xgb_probs + cat_probs + lgb_probs) / 3
predicted_labels = (ensemble_probs > 0.5).astype(bool)

# Добавление предсказаний в исходные данные
for obj, label in zip(dataset_control, predicted_labels):
    obj["isCommercial"] = bool(label)

# Сохранение обновлённого JSON
with open("dataset_control_predicted.json", "w", encoding="utf-8") as f:
    json.dump(dataset_control, f, ensure_ascii=False, indent=2)
