"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  if (!user || user.role !== "admin") {
    router.push("/login");
    return null;
  }

  const addItem = (type, setter) => {
    const newItem = { id: Date.now(), name: "" };
    setter((prev) => [...prev, newItem]);
  };

  const removeItem = (type, id) => {
    const setter =
      type === "area"
        ? setAreas
        : type === "entrance"
        ? setEntrances
        : setControlPoints;
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (type, id, name) => {
    const setter =
      type === "area"
        ? setAreas
        : type === "entrance"
        ? setEntrances
        : setControlPoints;
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const addRoute = () => {
    if (
      currentRoute.entrance &&
      currentRoute.controlPoint &&
      currentRoute.area
    ) {
      setRoutes((prev) => [...prev, { ...currentRoute, id: Date.now() }]);
      setCurrentRoute({ entrance: "", controlPoint: "", area: "" });
    }
  };

  const removeRoute = (id) => {
    setRoutes((prev) => prev.filter((route) => route.id !== id));
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

    const jsonData = JSON.stringify(eventData, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage("Event data saved and downloaded successfully!");
  };

  const renderItemList = (type, items, setter) => (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold capitalize">{type}s</h2>
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-2">
          <input
            type="text"
            value={item.name}
            onChange={(e) => updateItem(type, item.id, e.target.value)}
            placeholder={`${type.charAt(0).toUpperCase() + type.slice(1)} name`}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">ID: {item.id}</span>
          <button
            type="button"
            onClick={() => removeItem(type, item.id)}
            className="p-1 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addItem(type, setter)}
        className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
      >
        + Add {type}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold">Welcome, Admin {user.name}</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Capacity
              </label>
              <input
                type="number"
                value={eventCapacity}
                onChange={(e) => setEventCapacity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {renderItemList("area", areas, setAreas)}
            {renderItemList("entrance", entrances, setEntrances)}
            {renderItemList("controlPoint", controlPoints, setControlPoints)}

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Create Routes</h2>
              <div className="flex space-x-2">
                <select
                  value={currentRoute.entrance}
                  onChange={(e) =>
                    setCurrentRoute({
                      ...currentRoute,
                      entrance: e.target.value,
                    })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addRoute}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Route
                </button>
              </div>
              <div className="mt-2">
                <h3 className="text-md font-semibold">Created Routes:</h3>
                <ul className="list-disc list-inside">
                  {routes.map((route) => (
                    <li
                      key={route.id}
                      className="flex items-center justify-between"
                    >
                      <span>
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
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Save and Download
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </form>
          {message && (
            <div className="px-6 py-4 bg-green-100 border-t border-green-200 text-green-700">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
