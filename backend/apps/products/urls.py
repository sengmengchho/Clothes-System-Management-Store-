from django.urls import path
from .views import (
    CategoryListView,
    ProductListView,
    ProductDetailView,
    VariantCreateView,
    VariantDetailView,
)

urlpatterns = [
    # Categories
    path('categories/',                     CategoryListView.as_view(),  name='category-list'),

    # Products
    path('products/',                       ProductListView.as_view(),   name='product-list'),
    path('products/<int:pk>/',              ProductDetailView.as_view(), name='product-detail'),

    # Variants
    path('products/<int:pk>/variants/',     VariantCreateView.as_view(), name='variant-create'),
    path('variants/<int:pk>/',              VariantDetailView.as_view(), name='variant-detail'),
]
