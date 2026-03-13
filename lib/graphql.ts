import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      token
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation SignupUser($input: SignupInput!) {
    signup(input: $input) {
      id
      name
      email
      role
    }
  }
`;

export const REFRESH_SESSION = gql`
  mutation RefreshSession($input: RefreshSessionInput!) {
    refreshSession(input: $input) {
      token
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation LogoutUser($refreshToken: String!) {
    logout(refreshToken: $refreshToken)
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalStock
      marketValue
      lowInventory
      warehouseCount
      pendingPurchaseOrders
      alertsTriggered
      warehouseInsights {
        warehouseId
        warehouseName
        totalUnits
        lowStockSkus
      }
      receiptsTrend {
        label
        value
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
      imageUrl
      unitPrice
      quantity
      reorderLevel
      lowStock
      updatedAt
      balances {
        warehouseId
        warehouseCode
        warehouseName
        quantity
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      category
      imageUrl
      unitPrice
      quantity
      reorderLevel
      lowStock
      updatedAt
      balances {
        warehouseId
        warehouseCode
        warehouseName
        quantity
      }
    }
  }
`;

export const GET_PRODUCT_MOVEMENTS = gql`
  query GetProductMovements($productId: String!) {
    productMovements(productId: $productId) {
      id
      productId
      warehouseId
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

export const GET_WAREHOUSES = gql`
  query GetWarehouses {
    warehouses {
      id
      code
      name
      city
      totalUnits
      lowStockSkus
    }
    stockTransfers {
      id
      reference
      productId
      fromWarehouseId
      toWarehouseId
      quantity
      status
      createdAt
    }
  }
`;

export const GET_PROCUREMENT = gql`
  query GetProcurement {
    purchaseOrders {
      id
      reference
      supplier
      status
      warehouseId
      createdAt
      lines {
        id
        productId
        quantityOrdered
        quantityReceived
        unitPrice
      }
    }
    goodsReceipts {
      id
      reference
      purchaseOrderId
      warehouseId
      notes
      createdAt
      lines {
        id
        productId
        quantity
      }
    }
    warehouses {
      id
      code
      name
      city
      totalUnits
      lowStockSkus
    }
    products {
      id
      name
      category
      imageUrl
      unitPrice
      quantity
      reorderLevel
      lowStock
      updatedAt
      balances {
        warehouseId
        warehouseCode
        warehouseName
        quantity
      }
    }
  }
`;

export const GET_ALERTS = gql`
  query GetAlerts {
    alertRules {
      id
      name
      threshold
      channel
      isActive
      warehouseId
      productId
      createdAt
    }
    lowStockAlerts {
      productId
      productName
      warehouseId
      warehouseName
      quantity
      threshold
      severity
    }
  }
`;

export const GET_AUDIT_TRAIL = gql`
  query GetAuditTrail($limit: Int) {
    auditTrail(limit: $limit) {
      id
      action
      entityType
      entityId
      actorId
      metadata
      createdAt
    }
  }
`;

export const UPSERT_PRODUCT = gql`
  mutation UpsertProduct($input: UpsertProductInput!) {
    upsertProduct(input: $input) {
      id
      name
      category
      imageUrl
      unitPrice
      quantity
      reorderLevel
      lowStock
      updatedAt
      balances {
        warehouseId
        warehouseCode
        warehouseName
        quantity
      }
    }
  }
`;

export const ADJUST_STOCK = gql`
  mutation AdjustStock($input: AdjustStockInput!) {
    adjustStock(input: $input) {
      id
      name
      category
      imageUrl
      unitPrice
      quantity
      reorderLevel
      lowStock
      updatedAt
      balances {
        warehouseId
        warehouseCode
        warehouseName
        quantity
      }
    }
  }
`;

export const TRANSFER_STOCK = gql`
  mutation TransferStock($input: TransferStockInput!) {
    transferStock(input: $input) {
      id
      reference
      productId
      fromWarehouseId
      toWarehouseId
      quantity
      status
      createdAt
    }
  }
`;

export const CREATE_PURCHASE_ORDER = gql`
  mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput!) {
    createPurchaseOrder(input: $input) {
      id
      reference
      supplier
      status
      warehouseId
      createdAt
      lines {
        id
        productId
        quantityOrdered
        quantityReceived
        unitPrice
      }
    }
  }
`;

export const RECEIVE_PURCHASE_ORDER = gql`
  mutation ReceivePurchaseOrder($input: ReceivePurchaseOrderInput!) {
    receivePurchaseOrder(input: $input) {
      id
      reference
      purchaseOrderId
      warehouseId
      notes
      createdAt
      lines {
        id
        productId
        quantity
      }
    }
  }
`;

export const SAVE_ALERT_RULE = gql`
  mutation SaveAlertRule($input: SaveAlertRuleInput!) {
    saveAlertRule(input: $input) {
      id
      name
      threshold
      channel
      isActive
      warehouseId
      productId
      createdAt
    }
  }
`;

