import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8001",
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictRisk = async (payload) => {
  const response = await API.post("/predict", payload);
  return response.data;
};

export const bulkPredictRisk = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await axios.post("http://localhost:8001/bulk-predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};


