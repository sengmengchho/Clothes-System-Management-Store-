from django.urls import path
from .views import (
    OrderListCreateView,
    MyOrdersView,
    OrderDetailView,
    OrderStatusUpdateView,
)

urlpatterns = [
    path('orders/',                          OrderListCreateView.as_view(),  name='order-list-create'),
    path('orders/my/',                       MyOrdersView.as_view(),         name='order-mine'),
    path('orders/<int:pk>/',                 OrderDetailView.as_view(),      name='order-detail'),
    path('orders/<int:pk>/status/',          OrderStatusUpdateView.as_view(),name='order-status-update'),
]
