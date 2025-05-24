
import json
import pandas as pd
from osm_business_checker import check_multiple_addresses

# === Загрузка исходных данных ===
with open("dataset_train.json", encoding="utf-8") as f:
    dataset = json.load(f)

# === Преобразование в DataFrame
df = pd.DataFrame(dataset)

# === Получение списка адресов
addresses = df["address"].dropna().unique().tolist()

# === Проверка через OSM
print(f"🔍 Проверка {len(addresses)} уникальных адресов через OpenStreetMap...")
address_results = check_multiple_addresses(addresses)

# === Присвоение результата к DataFrame
df["has_business"] = df["address"].map(address_results)

# === Сохранение обновлённого файла
df.to_json("dataset_train_with_business.json", orient="records", indent=2, force_ascii=False)
print("✅ Обновлённый файл сохранён как dataset_train_with_business.json")
