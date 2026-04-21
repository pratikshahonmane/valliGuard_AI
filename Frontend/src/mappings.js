// mappings.js
export const fieldMappings = {
  transaction_type: ["CASH_IN", "CASH_OUT", "DEBIT", "PAYMENT", "TRANSFER"],
  merchant: ["Retail", "Online", "Grocery", "Other"],
  payment_method: ["Credit Card", "Bank Transfer", "Cash"],
  payment_channel: ["Mobile", "Web", "ATM"],
  device: ["iPhone", "Android", "Windows", "MacOS"],
  customer_gender: ["Male", "Female", "Other", "Unknown"],
  
  // Hierarchical Data for Dynamic Dropdowns
  countries: [
    { 
      name: "India", 
      cities: ["Mumbai", "Delhi", "Bangalore"], 
      states: ["MH", "DL", "KA"] 
    },
    { 
      name: "USA", 
      cities: ["New York", "Los Angeles", "Chicago"], 
      states: ["NY", "CA", "IL"] 
    },
    { 
      name: "Singapore", 
      cities: ["Singapore"], 
      states: ["Singapore"] 
    },
    { 
      name: "Australia", 
      cities: ["Sydney", "Melbourne"], 
      states: ["NSW", "VIC"] 
    }
  ]
};