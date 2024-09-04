import { jwtDecode } from "jwt-decode";

export const getRole = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.role;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  return null;
};

export const getUserId = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.userId;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  return null;
};

export const getEmail = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken?.email?.trim() || "";
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  return null;
};
