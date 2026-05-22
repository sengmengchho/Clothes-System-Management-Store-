from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Category, Product, ProductVariant
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    ProductVariantSerializer,
    ProductVariantWriteSerializer,
)
from apps.users.authentication import JWTAuthentication
from apps.users.permissions import IsAdmin, IsAdminOrSale


# ─────────────────────────────────────────────
#  GET /api/categories/
#  POST /api/categories/          (Admin)
# ─────────────────────────────────────────────
class CategoryListView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return [JWTAuthentication()]

    def get(self, request):
        categories = Category.objects.all()
        return Response(CategorySerializer(categories, many=True).data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
#  GET  /api/products/            (Public)
#  POST /api/products/            (Admin)
# ─────────────────────────────────────────────
class ProductListView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return [JWTAuthentication()]

    def get(self, request):
        products = Product.objects.prefetch_related('variants').filter(is_active=True)

        # Optional filters
        category = request.query_params.get('category')
        search   = request.query_params.get('search')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')

        if category:
            products = products.filter(category__name__iexact=category)
        if search:
            products = products.filter(product_name__icontains=search)
        if min_price:
            products = products.filter(base_price__gte=min_price)
        if max_price:
            products = products.filter(base_price__lte=max_price)

        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductWriteSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return Response(
                ProductDetailSerializer(product).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
#  GET    /api/products/<id>/     (Public)
#  PUT    /api/products/<id>/     (Admin)
#  DELETE /api/products/<id>/     (Admin — soft delete)
# ─────────────────────────────────────────────
class ProductDetailView(APIView):

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return [JWTAuthentication()]

    def get_object(self, pk):
        try:
            return Product.objects.prefetch_related('variants', 'category').get(pk=pk)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductDetailSerializer(product).data)

    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ProductDetailSerializer(product).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        product.is_active = False
        product.save()
        return Response({"message": "Product deactivated."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
#  POST /api/products/<id>/variants/       (Admin)
# ─────────────────────────────────────────────
class VariantCreateView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductVariantWriteSerializer(data=request.data)
        if serializer.is_valid():
            variant = serializer.save(product=product)
            return Response(
                ProductVariantSerializer(variant).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
#  PUT    /api/variants/<id>/     (Admin)
#  DELETE /api/variants/<id>/     (Admin)
# ─────────────────────────────────────────────
class VariantDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes     = [IsAuthenticated, IsAdmin]

    def get_object(self, pk):
        try:
            return ProductVariant.objects.get(pk=pk)
        except ProductVariant.DoesNotExist:
            return None

    def put(self, request, pk):
        variant = self.get_object(pk)
        if not variant:
            return Response({"error": "Variant not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductVariantWriteSerializer(variant, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ProductVariantSerializer(variant).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        variant = self.get_object(pk)
        if not variant:
            return Response({"error": "Variant not found."}, status=status.HTTP_404_NOT_FOUND)
        variant.delete()
        return Response({"message": "Variant deleted."}, status=status.HTTP_200_OK)
