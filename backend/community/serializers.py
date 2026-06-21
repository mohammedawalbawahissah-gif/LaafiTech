from rest_framework import serializers

from .models import CycleLog, Order, Product


class CycleLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycleLog
        fields = ["id", "period_start", "period_end", "symptoms", "notes", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "description", "category", "price", "image_url", "in_stock", "created_at"]
        read_only_fields = ["id", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")

    class Meta:
        model = Order
        fields = [
            "id", "product", "product_name", "quantity", "total_price",
            "delivery_phone", "delivery_location", "status", "created_at",
        ]
        read_only_fields = ["id", "total_price", "status", "created_at"]
