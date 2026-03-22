const API_BASE_URL = "/api";
import { PUBLIC_API_BASE_URL } from "$env/static/public";
import { getTokenFromCookie } from '../util.js';
import { goto } from '$app/navigation';

export async function apiGet(path) {
  const location=window.location.pathname;
  const headers = {};
  const token = getTokenFromCookie();
  if (token) headers["authorization"] = token;

  const response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
    method: "GET",
    headers,
  });
  return handleResponse(response,location);
}

export async function apiPost(path, data) {
  const location=window.location.pathname;
  const headers = { "Content-Type": "application/json" };
  const token = getTokenFromCookie();
  if (token) headers["authorization"] = token;

  const response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(response,location);
}

export async function apiPatch(path, data) {
  const location=window.location.pathname;
  const headers = { "Content-Type": "application/json" };
  const token = getTokenFromCookie();
  if (token) headers["authorization"] = token;

  const response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(response, location);
}

export async function apiDelete(path) {
  const location=window.location.pathname;
  const headers = {};
  const token = getTokenFromCookie();
  if (token) headers["authorization"] = token;

  const response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  return handleResponse(response, location);
}

async function handleResponse(response) {
  const location=window.location.pathname;
  if (!response.ok) {
    const error = await response.json();
    if(response.status === 401){
      const encodedData = encodeURIComponent(JSON.stringify(error));
      goto(`/login?data=${encodedData}&redirect=${location}&reset=1`);
    }else{
      
      throw new Error(error.error || error.message || "Unknown error");
    }

  }
  if(response.status === 204){
  }else{
    return response.json();
  }
  
}