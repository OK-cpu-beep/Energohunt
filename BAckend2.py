from fastapi import FastAPI, Query, HTTPException
from tortoise.contrib.fastapi import register_tortoise
from Backend1 import ElectricityConsumer, MonthlyConsumption
from typing import List, Dict
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic модели для ответа в нужном формате
class ConsumptionData(BaseModel):
    accountId: int
    isCommercial: bool
    address: str
    buildingType: str
    roomsCount: int
    residentsCount: int
    totalArea: float | None
    consumption: Dict[str, int]  # Используем строковые ключи для месяцев
    is_commercial_prob: float

class SearchItem(BaseModel):
    id: int
    title: str
    description: str
    avatar: str
    data: ConsumptionData

# Новый эндпоинт для получения данных в формате searchItems
@app.get("/consumers/", response_model=List[SearchItem])
async def get_search_items(
    page: int = Query(1, ge=1),
    per_page: int = Query(200, ge=1, le=400)
):
    offset = (page - 1) * per_page
    consumers = await ElectricityConsumer.all().order_by("-is_commercial_prob").offset(offset).limit(per_page).prefetch_related("consumptions")
    
    search_items = []
    for consumer in consumers:
        # Преобразуем список потребления в словарь с строковыми ключами
        consumption_dict = {str(record.month): record.value for record in consumer.consumptions}
        
        # Формируем title (первые три части адреса)
        address_parts = consumer.address.split(', ')
        title = ', '.join(address_parts[:3]) if len(address_parts) >= 3 else consumer.address
        
        # Формируем description (последняя часть адреса + остальные данные)
        last_address_part = address_parts[-1] if address_parts else ''
        description = f"{last_address_part} • {consumer.building_type} • {consumer.rooms_count} комнаты • {consumer.total_area or 0} м²"
        
        # Формируем avatar (первая буква первого слова адреса)
        avatar = consumer.address[0] if consumer.address else '?'
        
        search_item = SearchItem(
            id=consumer.account_id,
            title=title,
            description=description,
            avatar=avatar,
            data=ConsumptionData(
                accountId=consumer.account_id,
                isCommercial=consumer.is_commercial,
                address=consumer.address,
                buildingType=consumer.building_type,
                roomsCount=consumer.rooms_count,
                residentsCount=consumer.residents_count,
                totalArea=consumer.total_area,
                consumption=consumption_dict,
                is_commercial_prob=consumer.is_commercial_prob  # Здесь можно добавить реальное значение вероятности
            )
        )
        search_items.append(search_item)
    
    return search_items

# Эндпоинт для одного потребителя в нужном формате
@app.get("/dashboard/{account_id}", response_model=SearchItem)
async def get_search_item(account_id: int):
    consumer = await ElectricityConsumer.get_or_none(account_id=account_id).prefetch_related("consumptions")
    if not consumer:
        raise HTTPException(status_code=404, detail="Consumer not found")
    
    consumption_dict = {str(record.month): record.value for record in consumer.consumptions}
    address_parts = consumer.address.split(', ')
    
    return SearchItem(
        id=consumer.account_id,
        title=', '.join(address_parts[:3]) if len(address_parts) >= 3 else consumer.address,
        description=f"{address_parts[-1] if address_parts else ''} • {consumer.building_type} • {consumer.rooms_count} комнаты • {consumer.total_area or 0} м²",
        avatar=consumer.address[0] if consumer.address else '?',
        data=ConsumptionData(
            accountId=consumer.account_id,
            isCommercial=consumer.is_commercial,
            address=consumer.address,
            buildingType=consumer.building_type,
            roomsCount=consumer.rooms_count,
            residentsCount=consumer.residents_count,
            totalArea=consumer.total_area,
            consumption=consumption_dict,
            is_commercial_prob=consumer.is_commercial_prob  # Замените на реальное значение
        )
    )

# Подключение Tortoise ORM
register_tortoise(
    app,
    db_url="mysql://root:1234@localhost:3306/electricity_db",
    modules={"models": ["Backend1"]},
    generate_schemas=True,
    add_exception_handlers=True,
)