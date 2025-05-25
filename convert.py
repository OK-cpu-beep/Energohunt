import json
from tortoise import run_async
from tortoise import Tortoise
from Backend1 import ElectricityConsumer, MonthlyConsumption  # Предполагается, что модели в файле models.py
from collections import OrderedDict

async def init_db():
    await Tortoise.init(
        db_url="mysql://root:1234@localhost:3306/electricity_db",
        modules={'models': ['Backend1']}  # Укажите правильный модуль с моделями
    )
    await Tortoise.generate_schemas()

async def insert_consumers(json_file_path):
    # Чтение JSON файла
    with open(json_file_path, 'r', encoding='utf-8') as file:
        consumers_data = json.load(file, object_pairs_hook=OrderedDict)
    
    # Вставка данных
    for consumer_data in consumers_data:
        try:
            consumer_data['roomsCount']
        except:
            consumer_data['roomsCount'] = 0
        try:
            consumer_data['residentsCount']
        except:
            consumer_data['residentsCount'] = 0
        try:
            consumer_data['totalArea']
        except:
            consumer_data['totalArea'] = 0
        
        # Создаем или обновляем потребителя
        consumer, created = await ElectricityConsumer.get_or_create(
            account_id=consumer_data['accountId'],
            defaults={
                'is_commercial': consumer_data['isCommercial'],
                'address': consumer_data['address'],
                'building_type': 'Коммерческое' if consumer_data['isCommercial'] else 'Частный',
                'rooms_count': consumer_data['roomsCount'],
                'residents_count': consumer_data['residentsCount'],
                'total_area': consumer_data['totalArea'],
                'is_commercial_prob': consumer_data['probability_isCommercial']
            }
        )
        
        if not created:
            # Обновляем существующую запись
            consumer.total_area = consumer_data["totalArea"]
            consumer.is_commercial = consumer_data['isCommercial']
            consumer.address = consumer_data['address']
            consumer.rooms_count = consumer_data['roomsCount']
            consumer.residents_count = consumer_data['residentsCount']
            consumer.is_commercial_prob = consumer_data['probability_isCommercial']
            await consumer.save()
        
        # Добавляем данные о потреблении
        if 'consumption' in consumer_data:
            for m in range(1,13):
                month_str = str(m)
                try:
                    value = consumer_data['consumption'][month_str]
                except:
                    value = 0
                await MonthlyConsumption.update_or_create(
                    account_id=consumer_data['accountId'],
                    month=m,
                    defaults={
                        'value': value,
                        'consumer_id': consumer.account_id
                    }
                )
        print(f"Обработан потребитель ID: {consumer_data['accountId']}")

async def main():
    await init_db()
    await insert_consumers('sorted_predictions_ensemble.json')  # Укажите путь к вашему JSON файлу
    await Tortoise.close_connections()
if __name__ == '__main__':
    run_async(main())