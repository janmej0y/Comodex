import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      category
      unitPrice
      quantity
      updatedAt
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      category
      unitPrice
      quantity
      updatedAt
    }
  }
`;

export const GET_PRODUCT_MOVEMENTS = gql`
  query GetProductMovements($productId: String!) {
    productMovements(productId: $productId) {
      id
      productId
      type
      quantity
      reason
      createdAt
    }
  }
`;

export const GET_PRODUCT_TREND = gql`
  query GetProductTrend($productId: String!) {
    productTrend(productId: $productId) {
      label
      value
    }
  }
`;

export const UPSERT_PRODUCT = gql`
  mutation UpsertProduct($input: UpsertProductInput!) {
    upsertProduct(input: $input) {
      id
      name
      category
      unitPrice
      quantity
      updatedAt
    }
  }
`;

export const ADJUST_STOCK = gql`
  mutation AdjustStock($input: AdjustStockInput!) {
    adjustStock(input: $input) {
      id
      name
      category
      unitPrice
      quantity
      updatedAt
    }
  }
`;