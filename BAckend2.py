from fastapi import FastAPI, Query, HTTPException
from tortoise.contrib.fastapi import register_tortoise
from models import ElectricityConsumer, MonthlyConsumption
from typing import List
from pydantic import BaseModel

app = FastAPI()

# Pydantic модели для ответов
class MonthlyConsumptionOut(BaseModel):
    month: int
    value: int

class ConsumerOut(BaseModel):
    account_id: int
    is_commercial: bool
    address: str
    building_type: str
    rooms_count: int
    residents_count: int
    total_area: float | None
    consumptions: List[MonthlyConsumptionOut]

    class Config:
        from_attributes = True

# Эндпоинт с пагинацией
@app.get("/consumers/", response_model=List[ConsumerOut])
async def get_consumers(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100)
):
    offset = (page - 1) * per_page
    consumers = await ElectricityConsumer.all().offset(offset).limit(per_page).prefetch_related("consumptions")
    return consumers

# Эндпоинт для конкретного потребителя
@app.get("/consumers/{account_id}", response_model=ConsumerOut)
async def get_consumer(account_id: int):
    consumer = await ElectricityConsumer.get_or_none(account_id=account_id).prefetch_related("consumptions")
    if not consumer:
        raise HTTPException(status_code=404, detail="Consumer not found")
    return consumer

# Подключение Tortoise ORM
register_tortoise(
    app,
    db_url="mysql://root:1234@localhost:3306/electricity_db",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)from fastapi import FastAPI, Query, HTTPException
from tortoise.contrib.fastapi import register_tortoise
from models import ElectricityConsumer, MonthlyConsumption
from typing import List
from pydantic import BaseModel

app = FastAPI()

# Pydantic модели для ответов
class MonthlyConsumptionOut(BaseModel):
    month: int
    value: int

class ConsumerOut(BaseModel):
    account_id: int
    is_commercial: bool
    address: str
    building_type: str
    rooms_count: int
    residents_count: int
    total_area: float | None
    consumptions: List[MonthlyConsumptionOut]

    class Config:
        from_attributes = True

# Эндпоинт с пагинацией
@app.get("/consumers/", response_model=List[ConsumerOut])
async def get_consumers(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100)
):
    offset = (page - 1) * per_page
    consumers = await ElectricityConsumer.all().offset(offset).limit(per_page).prefetch_related("consumptions")
    return consumers

# Эндпоинт для конкретного потребителя
@app.get("/consumers/{account_id}", response_model=ConsumerOut)
async def get_consumer(account_id: int):
    consumer = await ElectricityConsumer.get_or_none(account_id=account_id).prefetch_related("consumptions")
    if not consumer:
        raise HTTPException(status_code=404, detail="Consumer not found")
    return consumer

# Подключение Tortoise ORM
register_tortoise(
    app,
    db_url="mysql://root:1234@localhost:3306/electricity_db",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)