import random
from django.db import models
from rest_framework import viewsets, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsPharmacist

class Inventory(models.Model):
    STATUS_CHOICES = [('in_stock','In Stock'),('low_stock','Low Stock'),('out_of_stock','Out of Stock')]

    drug_uid    = models.CharField(max_length=20, unique=True, blank=True)
    name        = models.CharField(max_length=200)
    category    = models.CharField(max_length=100, blank=True)
    stock_qty   = models.IntegerField(default=0)
    unit        = models.CharField(max_length=50, blank=True)
    supplier    = models.CharField(max_length=200, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    reorder_at  = models.IntegerField(default=50)
    unit_price  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_stock')
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.drug_uid:
            uid = f'RX-{random.randint(100,999)}'
            while Inventory.objects.filter(drug_uid=uid).exists():
                uid = f'RX-{random.randint(100,999)}'
            self.drug_uid = uid
        if self.stock_qty == 0:
            self.status = 'out_of_stock'
        elif self.stock_qty < self.reorder_at:
            self.status = 'low_stock'
        else:
            self.status = 'in_stock'
        super().save(*args, **kwargs)

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Inventory
        fields = ['id','drug_uid','name','category','stock_qty','unit','supplier','expiry_date','reorder_at','unit_price','status','updated_at']
        read_only_fields = ['id','drug_uid','status','updated_at']

class InventoryViewSet(viewsets.ModelViewSet):
    queryset           = Inventory.objects.all()
    serializer_class   = InventorySerializer
    permission_classes = [IsPharmacist]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status','category']
    search_fields      = ['name','drug_uid','supplier']
    ordering_fields    = ['name','stock_qty','expiry_date']

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        qs = self.queryset.filter(status__in=['low_stock','out_of_stock'])
        return Response(InventorySerializer(qs, many=True).data)