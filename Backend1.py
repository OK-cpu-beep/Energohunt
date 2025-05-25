from tortoise import fields, models

class ElectricityConsumer(models.Model):
    account_id = fields.IntField(pk=True)
    is_commercial = fields.BooleanField()
    address = fields.TextField()
    building_type = fields.CharField(max_length=50)
    rooms_count = fields.IntField()
    residents_count = fields.IntField()
    total_area = fields.FloatField(null=True)
    is_commercial_prob = fields.FloatField(default=0.0)  # Добавлено поле вероятности
    consumptions = fields.ReverseRelation["MonthlyConsumption"]
    
    class Meta:
        ordering = ["-is_commercial_prob"]

class MonthlyConsumption(models.Model):
    id = fields.IntField(pk=True, generated=True)
    account_id = fields.IntField()
    month = fields.IntField()
    value = fields.IntField()
    consumer = fields.ForeignKeyField(
        "models.ElectricityConsumer",
        related_name="consumptions",
        to_field="account_id",
        on_delete=fields.CASCADE
    )

    class Meta:
        unique_together = (("account_id", "month"),)