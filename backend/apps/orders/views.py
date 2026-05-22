from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Order, OrderItem
from .serializers import (
    OrderItemInputSerializer,
    OrderSerializer,
    OrderListSerializer,
    OrderStatusSerializer,
)
from apps.users.authentication import JWTAuthentication
from apps.users.permissions import IsAdmin, IsAdminOrSale, IsCustomer
from apps.products.models import ProductVariant


# ─────────────────────────────────────────────
#  POST /api/orders/              (Customer)
#  GET  /api/orders/              (Admin / Sale — all orders)
# ─────────────────────────────────────────────
class OrderListCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        # Only Admin / Sale can see all orders
        if request.user.role not in ['Admin', 'Sale']:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        orders = Order.objects.select_related('user').prefetch_related('items')

        # Optional filters
        order_status = request.query_params.get('status')
        user_id      = request.query_params.get('user_id')

        if order_status:
            orders = orders.filter(status=order_status)
        if user_id:
            orders = orders.filter(user_id=user_id)

        serializer = OrderListSerializer(orders, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Only customers can place orders
        if request.user.role != 'Customer':
            return Response(
                {"error": "Only customers can place orders."},
                status=status.HTTP_403_FORBIDDEN,
            )

        shipping_address = request.data.get('shipping_address', '').strip()
        if not shipping_address:
            return Response(
                {"error": "Shipping address is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items_data = request.data.get('items', [])
        if not items_data:
            return Response(
                {"error": "Order must contain at least one item."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate all items first
        item_serializers = []
        for item in items_data:
            s = OrderItemInputSerializer(data=item)
            if not s.is_valid():
                return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)
            item_serializers.append(s.validated_data)

        # Place order in one transaction — MySQL triggers handle stock deduction
        try:
            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    shipping_address=shipping_address,
                    status='Pending',
                    total_price=0,
                )

                total = 0
                for item in item_serializers:
                    variant = ProductVariant.objects.select_for_update().get(
                        pk=item['variant_id']
                    )

                    # Stock check (mirrors MySQL trigger — double safety)
                    if variant.stock < item['quantity']:
                        raise ValueError(
                            f"Insufficient stock for variant {variant.sku or variant.variant_id}."
                        )

                    unit_price = variant.price if variant.price else variant.product.base_price

                    OrderItem.objects.create(
                        order=order,
                        variant=variant,
                        quantity=item['quantity'],
                        unit_price=unit_price,
                    )
                    total += unit_price * item['quantity']

                    # Deduct stock
                    variant.stock -= item['quantity']
                    variant.save()

                order.total_price = total
                order.save()

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


# ─────────────────────────────────────────────
#  GET /api/orders/my/            (Customer — own orders)
# ─────────────────────────────────────────────
class MyOrdersView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get(self, request):
        orders = (
            Order.objects
            .filter(user=request.user)
            .prefetch_related('items__variant__product')
        )
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


# ─────────────────────────────────────────────
#  GET   /api/orders/<id>/        (Customer own / Admin / Sale)
#  PATCH /api/orders/<id>/status/ (Admin / Sale)
# ─────────────────────────────────────────────
class OrderDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Order.objects.prefetch_related(
                'items__variant__product', 'user'
            ).get(pk=pk)
        except Order.DoesNotExist:
            return None

    def get(self, request, pk):
        order = self.get_object(pk)
        if not order:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Customer can only view their own orders
        if request.user.role == 'Customer' and order.user != request.user:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        return Response(OrderSerializer(order).data)


class OrderStatusUpdateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdminOrSale]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": f"Order #{pk} status updated to '{order.status}'."}
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
