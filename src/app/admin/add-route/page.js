"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { PlusCircle, XCircle, Save, LogOut, User } from "lucide-react";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [eventCapacity, setEventCapacity] = useState("");
  const [areas, setAreas] = useState([]);
  const [entrances, setEntrances] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [message, setMessage] = useState("");

  const [currentRoute, setCurrentRoute] = useState({
    entrance: "",
    controlPoint: "",
    area: "",
  });

  useEffect(() => {
    const storedData = localStorage.getItem("eventData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setEventCapacity(parsedData.capacity || "");
      setAreas(parsedData.areas || []);
      setEntrances(parsedData.entrances || []);
      setControlPoints(parsedData.controlPoints || []);
      setRoutes(parsedData.routes || []);
    }
  }, []);

  if (!user || user.role !== "admin") {
    router.push("/login");
    return null;
  }

  const addItem = (type, setter) => {
    const newItem = { id: Date.now(), name: "" };
    setter((prev) => {
      const updated = [...prev, newItem];
      saveToLocalStorage({ [type + "s"]: updated });
      return updated;
    });
  };

  const removeItem = (type, id) => {
    const setter =
      type === "area"
        ? setAreas
        : type === "entrance"
        ? setEntrances
        : setControlPoints;
    setter((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToLocalStorage({ [type + "s"]: updated });
      return updated;
    });
  };

  const updateItem = (type, id, name) => {
    const setter =
      type === "area"
        ? setAreas
        : type === "entrance"
        ? setEntrances
        : setControlPoints;
    setter((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, name } : item
      );
      saveToLocalStorage({ [type + "s"]: updated });
      return updated;
    });
  };

  const addRoute = () => {
    if (
      currentRoute.entrance &&
      currentRoute.controlPoint &&
      currentRoute.area
    ) {
      setRoutes((prev) => {
        const updated = [...prev, { ...currentRoute, id: Date.now() }];
        saveToLocalStorage({ routes: updated });
        return updated;
      });
      setCurrentRoute({ entrance: "", controlPoint: "", area: "" });
    }
  };

  const removeRoute = (id) => {
    setRoutes((prev) => {
      const updated = prev.filter((route) => route.id !== id);
      saveToLocalStorage({ routes: updated });
      return updated;
    });
  };

  const saveToLocalStorage = (data) => {
    const currentData = JSON.parse(localStorage.getItem("eventData") || "{}");
    const updatedData = { ...currentData, ...data };
    localStorage.setItem("eventData", JSON.stringify(updatedData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");

    const eventData = {
      capacity: eventCapacity,
      areas,
      entrances,
      controlPoints,
      routes,
    };

    saveToLocalStorage(eventData);
    setMessage("Event data saved successfully!");
  };

  const renderItemList = (type, items, setter) => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold capitalize text-gray-200 flex items-center">
        <span className="mr-2">{type}s</span>
        <button
          type="button"
          onClick={() => addItem(type, setter)}
          className="text-gray-400 hover:text-white transition-colors"
          title={`Add ${type}`}
        >
          <PlusCircle size={20} />
        </button>
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(type, item.id, e.target.value)}
              placeholder={`${
                type.charAt(0).toUpperCase() + type.slice(1)
              } name`}
              className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-gray-200 placeholder-gray-500"
            />
            <button
              type="button"
              onClick={() => removeItem(type, item.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
              title={`Remove ${type}`}
            >
              <XCircle size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden border border-gray-700">
          <div className="px-6 py-4 bg-gray-800 text-white flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-700 rounded-full">
                <User size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Event Capacity
                </label>
                <input
                  type="number"
                  value={eventCapacity}
                  onChange={(e) => setEventCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderItemList("area", areas, setAreas)}
              {renderItemList("entrance", entrances, setEntrances)}
              {renderItemList("controlPoint", controlPoints, setControlPoints)}
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-200">
                Create Routes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={currentRoute.entrance}
                  onChange={(e) =>
                    setCurrentRoute({
                      ...currentRoute,
                      entrance: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-200"
                >
                  <option value="">Select Entrance</option>
                  {entrances.map((entrance) => (
                    <option key={entrance.id} value={entrance.id}>
                      {entrance.name}
                    </option>
                  ))}
                </select>
                <select
                  value={currentRoute.controlPoint}
                  onChange={(e) =>
                    setCurrentRoute({
                      ...currentRoute,
                      controlPoint: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-200"
                >
                  <option value="">Select Control Point</option>
                  {controlPoints.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.name}
                    </option>
                  ))}
                </select>
                <select
                  value={currentRoute.area}
                  onChange={(e) =>
                    setCurrentRoute({ ...currentRoute, area: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-200"
                >
                  <option value="">Select Area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addRoute}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Route
              </button>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Created Routes:
                </h3>
                <ul className="space-y-2">
                  {routes.map((route) => (
                    <li
                      key={route.id}
                      className="flex items-center justify-between bg-gray-700 p-2 rounded-md"
                    >
                      <span className="text-gray-300">
                        {entrances.find((e) => e.id == route.entrance)?.name} →{" "}
                        {
                          controlPoints.find(
                            (cp) => cp.id == route.controlPoint
                          )?.name
                        }{" "}
                        → {areas.find((a) => a.id == route.area)?.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRoute(route.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <XCircle size={20} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Save size={18} className="mr-2" />
                Save Changes
              </button>
            </div>
          </form>
          {message && (
            <div className="px-6 py-4 bg-green-900 border-t border-green-800 text-green-200">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
