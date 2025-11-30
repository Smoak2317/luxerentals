import { Product } from '../types';

// Replace with your actual WhatsApp business number
const PHONE_NUMBER = "919876543210"; 

export const generateWhatsAppLink = (product: Product): string => {
  const message = `Hello, I am interested in renting the *${product.name}* (ID: ${product.id}). Is it available for my dates?`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
};

export const generateGeneralInquiryLink = (): string => {
  const message = "Hello, I have a query regarding your rental services.";
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`;
};