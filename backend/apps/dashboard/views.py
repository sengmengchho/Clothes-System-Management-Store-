from django.db.models import Sum, Count, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.authentication import JWTAuthentication
from apps.users.permissions import IsAdmin, IsAdminOrSale
from apps.users.models import User
from apps.products.models import Product, ProductVariant
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import OrderListSerializer
from apps.products.serializers import ProductVariantSerializer


# ─────────────────────────────────────────────
#  GET /api/dashboard/summary/   (Admin only)
# ─────────────────────────────────────────────
class DashboardSummaryView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # Revenue — sum of all delivered orders
        revenue = (
            Order.objects
            .filter(status='Delivered')
            .aggregate(total=Sum('total_price'))['total'] or 0
        )

        # Orders count by status
        orders_by_status = (
            Order.objects
            .values('status')
            .annotate(count=Count('order_id'))
        )
        status_map = {row['status']: row['count'] for row in orders_by_status}

        # Users
        total_customers = User.objects.filter(role='Customer', status='Active').count()
        total_sale      = User.objects.filter(role='Sale',     status='Active').count()

        # Products
        total_products = Product.objects.filter(is_active=True).count()
        out_of_stock   = ProductVariant.objects.filter(stock=0).count()

        # Top 5 best-selling variants
        top_items = (
            OrderItem.objects
            .values(
                product_name=F('variant__product__product_name'),
                size=F('variant__size'),
                color=F('variant__color'),
            )
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:5]
        )

        return Response({
            "revenue": {
                "total_delivered": float(revenue),
            },
            "orders": {
                "total":       sum(status_map.values()),
                "by_status":   status_map,
            },
            "users": {
                "total_customers": total_customers,
                "total_sale_staff": total_sale,
            },
            "products": {
                "total_active": total_products,
                "out_of_stock": out_of_stock,
            },
            "top_selling": list(top_items),
        })


# ─────────────────────────────────────────────
#  GET /api/dashboard/low-stock/  (Admin / Sale)
#  Returns variants with stock <= threshold (default 10)
# ─────────────────────────────────────────────
class LowStockView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdminOrSale]

    def get(self, request):
        threshold = int(request.query_params.get('threshold', 10))

        variants = (
            ProductVariant.objects
            .select_related('product__category')
            .filter(stock__lte=threshold)
            .order_by('stock')
        )

        data = [
            {
                "variant_id":   v.variant_id,
                "sku":          v.sku,
                "product_name": v.product.product_name,
                "category":     v.product.category.name,
                "size":         v.size,
                "color":        v.color,
                "stock":        v.stock,
            }
            for v in variants
        ]

        return Response({
            "threshold": threshold,
            "count":     len(data),
            "variants":  data,
        })


# ─────────────────────────────────────────────
#  GET /api/dashboard/recent-orders/  (Admin / Sale)
# ─────────────────────────────────────────────
class RecentOrdersView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdminOrSale]

    def get(self, request):
        limit  = int(request.query_params.get('limit', 10))
        orders = (
            Order.objects
            .select_related('user')
            .prefetch_related('items')
            .order_by('-ordered_at')[:limit]
        )
        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────
#  GET /api/dashboard/sales-by-category/  (Admin)
# ─────────────────────────────────────────────
class SalesByCategoryView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdmin]

    def get(self, request):
        data = (
            OrderItem.objects
            .values(category=F('variant__product__category__name'))
            .annotate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum(F('quantity') * F('unit_price')),
            )
            .order_by('-total_revenue')
        )
        return Response(list(data))
