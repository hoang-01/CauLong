import { Card, Row, Col } from "antd";
import type { PosProduct } from "../types/sale.types";
import { usePosStore } from "../store/sale.store";

interface Props {
  products: PosProduct[];
}

const ProductGrid = ({
  products,
}: Props) => {
  const addToCart =
    usePosStore(
      (state) => state.addToCart
    );

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => (
        <Col
          key={product.variant.id}
          span={6}
        >
          <Card
            hoverable
            onClick={() =>
              addToCart({
                variantId:
                  product.variant.id,

                productId:
                  product.variant.product.id,

                name: product.variant.product.name,

                sku: product.variant.sku,

                price: product.variant.price_cents,

                stock: product.quantity_on_hand,

                quantity: 1,
              })
            }
          >
            <img
              src={product.variant.product.thumbnail_url || undefined}
              alt={product.variant.product.name}
              width="100%"
            />

            <h4>{product.variant.product.name}</h4>

            <p>
              {product.variant.price_cents.toLocaleString()}
              đ
            </p>

            <p>
              Tồn kho:
              {product.quantity_on_hand}
            </p>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ProductGrid;