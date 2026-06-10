// src/config/brand.tsx
import defaultIcon from '../assets/icon.svg';

export const BRAND_CONFIG = {
  title: "Sistema de Monitorização EDI",
  icon: (
    <img 
      src={defaultIcon} 
      alt="Logo" 
      style={{ width: 22, height: 22, display: 'block' }} 
    />
  ),
  logoText: "Flux-Monitor",
  logoTextCollapsed: "Flux",
  clientCompany: "Your Company Name", 
};