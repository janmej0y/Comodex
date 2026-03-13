export function getProductImage(productId: string) {
  const images: Record<string, string> = {
    "P-101": "/products/arabica-coffee.svg",
    "P-102": "/products/wheat-flour.svg",
    "P-103": "/products/rock-salt.svg",
    "P-104": "/products/olive-oil.svg"
  };

  return images[productId] ?? "/products/default-product.svg";
}
