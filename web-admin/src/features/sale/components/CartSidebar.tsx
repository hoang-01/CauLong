import {
  Button,
  Divider,
  message,
} from "antd";

import { usePosStore } from "../store/sale.store";
import { PosService } from "../services/sale.api";

const CartSidebar = () => {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    selectedFacilityId,
  } = usePosStore();

  const total = cart.reduce(
    (sum, item) =>
      sum +
      item.price *
        item.quantity,
    0
  );

  const handleCheckout =
    async () => {
      try {
        if (
          !selectedFacilityId
        ) {
          message.error(
            "Vui lòng chọn cơ sở"
          );
          return;
        }

        if (
          cart.length === 0
        ) {
          message.error(
            "Giỏ hàng đang trống"
          );
          return;
        }

        await PosService.createOrder(
          {
            facilityId:
              selectedFacilityId,

            paymentMethod:
              "cash",

            items: cart.map(
              (item) => ({
                variantId:
                  item.variantId,
                quantity:
                  item.quantity,
              })
            ),
          }
        );

        clearCart();

        message.success(
          "Tạo đơn hàng thành công"
        );
      } catch (error) {
        console.error(error);

        message.error(
          "Thanh toán thất bại"
        );
      }
    };

  return (
    <>
      <h3>Giỏ hàng</h3>

      {cart.map((item) => (
        <div
          key={
            item.variantId
          }
          style={{
            marginBottom: 12,
          }}
        >
          <div>
            {item.name}
          </div>

          <div>
            <Button
              onClick={() =>
                updateQuantity(
                  item.variantId,
                  Math.max(
                    1,
                    item.quantity -
                      1
                  )
                )
              }
            >
              -
            </Button>

            <span
              style={{
                margin:
                  "0 10px",
              }}
            >
              {
                item.quantity
              }
            </span>

            <Button
              onClick={() =>
                updateQuantity(
                  item.variantId,
                  item.quantity +
                    1
                )
              }
            >
              +
            </Button>
          </div>

          <Button
            danger
            onClick={() =>
              removeItem(
                item.variantId
              )
            }
          >
            Xóa
          </Button>
        </div>
      ))}

      <Divider />

      <h2>
        {total.toLocaleString()}
        đ
      </h2>

      <Button
        block
        type="primary"
        onClick={
          handleCheckout
        }
      >
        Thanh toán
      </Button>
    </>
  );
};

export default CartSidebar;