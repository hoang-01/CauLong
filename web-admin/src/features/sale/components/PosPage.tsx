import { useEffect, useState, useCallback } from "react";
import { Row, Col, Select, Input } from "antd";
import ProductGrid from "./ProductGrid";
import CartSidebar from "./CartSidebar";
import { PosService } from "../services/sale.api";
import type {
  Facility,
  PosProduct,
} from "../types/sale.types";
import { usePosStore } from "../store/sale.store";

const PosPage = () => {
  const setSelectedFacilityId =
    usePosStore(
      (state) => state.setFacilityId
    );

  const [facilities, setFacilities] =
    useState<Facility[]>([]);

  const [products, setProducts] =
    useState<PosProduct[]>([]);

  const [facilityId, setFacilityId] =
    useState<number>();

  const [keyword, setKeyword] =
    useState("");

  const loadFacilities = useCallback(
    async () => {
      const res =
        await PosService.getFacilities();

      setFacilities(res.data);
    },
    []
  );

  const loadProducts = useCallback(
    async (
      selectedFacilityId: number
    ) => {
      const res =
        await PosService.getProductsByFacility(
          selectedFacilityId
        );

      setProducts(res.data);
    },
    []
  );

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    if (!facilityId) return;

    loadProducts(facilityId);
  }, [facilityId, loadProducts]);

  const handleFacilityChange = (
    value: number
  ) => {
    setFacilityId(value);

    setSelectedFacilityId(value);
  };

  const filteredProducts = products
    .filter((p) => p.variant?.product)
    .filter((p) =>
      p.variant.product.name
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Select
          style={{ width: 300 }}
          placeholder="Chọn cơ sở"
          value={facilityId}
          onChange={
            handleFacilityChange
          }
        >
          {facilities.map((f) => (
            <Select.Option
              key={f.id}
              value={f.id}
            >
              {f.name}
            </Select.Option>
          ))}
        </Select>

        <Input.Search
          style={{ marginTop: 16 }}
          placeholder="Tìm sản phẩm"
          value={keyword}
          onChange={(e) =>
            setKeyword(
              e.target.value
            )
          }
        />

        <ProductGrid
          products={
            filteredProducts
          }
        />
      </Col>

      <Col span={8}>
        <CartSidebar />
      </Col>
    </Row>
  );
};

export default PosPage;