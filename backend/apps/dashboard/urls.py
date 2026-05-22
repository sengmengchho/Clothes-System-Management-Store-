from django.urls import path
from .views import (
    DashboardSummaryView,
    LowStockView,
    RecentOrdersView,
    SalesByCategoryView,
)

urlpatterns = [
    path('dashboard/summary/',            DashboardSummaryView.as_view(),  name='dashboard-summary'),
    path('dashboard/low-stock/',          LowStockView.as_view(),           name='dashboard-low-stock'),
    path('dashboard/recent-orders/',      RecentOrdersView.as_view(),       name='dashboard-recent-orders'),
    path('dashboard/sales-by-category/',  SalesByCategoryView.as_view(),    name='dashboard-sales-category'),
]