import { useCallback, useEffect, useState } from "react";
export async function api(path, method = "GET", body) {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response
    .json()
    .catch(() => ({ message: "API unavailable. Start the backend server." }));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}
export function useData(path) {
  const [snapshot, setSnapshot] = useState({
    path: null,
    data: null,
    error: "",
    loading: true,
  });
  const refresh = useCallback(async () => {
    setSnapshot((previous) => ({ ...previous, loading: true }));
    try {
      setSnapshot({ path, data: await api(path), error: "", loading: false });
    } catch (e) {
      setSnapshot({ path, data: null, error: e.message, loading: false });
    }
  }, [path]);
  useEffect(() => {
    let active = true;
    api(path)
      .then((value) => {
        if (active) {
          setSnapshot({ path, data: value, error: "", loading: false });
        }
      })
      .catch((e) => {
        if (active)
          setSnapshot({ path, data: null, error: e.message, loading: false });
      });
    return () => {
      active = false;
    };
  }, [path]);
  return {
    ...(snapshot.path === path
      ? snapshot
      : { data: null, error: "", loading: true }),
    refresh,
  };
}
export const currency = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    value || 0,
  );
