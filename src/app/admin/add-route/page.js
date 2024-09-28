"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  XCircle,
  Save,
  LogOut,
  User,
  Users,
  Percent,
  AlertCircle,
  ArrowRight,
  FastForward,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [eventCapacity, setEventCapacity] = useState("");
  const [areas, setAreas] = useState([]);
  const [entrances, setEntrances] = useState([]);
  const [controlPoints, setControlPoints] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [occupancyData, setOccupancyData] = useState([]);
  const [isFastForward, setIsFastForward] = useState(false);
  const [isEventEnded, setIsEventEnded] = useState(false);
  const [targetOccupancy, setTargetOccupancy] = useState(
    Math.floor(Math.random() * (100 - 75 + 1)) + 75
  );
  const isSimulationRunning = useRef(true);
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

  const [liveData, setLiveData] = useState({
    areas: {},
    entrances: {},
    controlPoints: {},
    inTransit: {
      atEntrances: {},
      toControlPoints: {},
      toAreas: {},
    },
    totalEntered: 0,
    currentOccupancy: 0,
    remainingCapacity: parseInt(eventCapacity) || 0,
  });

  useEffect(() => {
    let interval;
    const simulationSpeed = isFastForward ? 50 : 2000;
    let fastForwardStartTime;

    const runSimulation = () => {
      if (!isSimulationRunning.current) return;

      setLiveData((prevData) => {
        const newData = { ...prevData };
        let newEntrants = 0;

        if (!isEventEnded) {
          // Generate new entrants
          entrances.forEach((entrance) => {
            const entranceCount = Math.floor(
              Math.random() * (isFastForward ? 500 : 50)
            );
            newData.inTransit.atEntrances[entrance.id] =
              (newData.inTransit.atEntrances[entrance.id] || 0) + entranceCount;
            newEntrants += entranceCount;
          });

          newData.totalEntered += newEntrants;
        }

        // Process people through routes
        routes.forEach((route) => {
          // Move people from entrance to control point
          const availableAtEntrance =
            newData.inTransit.atEntrances[route.entrance] || 0;
          const toControlPoint = Math.min(
            availableAtEntrance,
            Math.floor(Math.random() * (isFastForward ? 300 : 30)) + 1
          );
          newData.inTransit.atEntrances[route.entrance] -= toControlPoint;
          newData.entrances[route.entrance] =
            (newData.entrances[route.entrance] || 0) + toControlPoint;
          newData.inTransit.toControlPoints[route.controlPoint] =
            (newData.inTransit.toControlPoints[route.controlPoint] || 0) +
            toControlPoint;

          // Move people from in-transit to control point
          const arrivedAtControlPoint = Math.floor(
            (newData.inTransit.toControlPoints[route.controlPoint] || 0) *
              (isFastForward ? 0.98 : 0.9)
          );
          newData.inTransit.toControlPoints[route.controlPoint] -=
            arrivedAtControlPoint;
          newData.controlPoints[route.controlPoint] =
            (newData.controlPoints[route.controlPoint] || 0) +
            arrivedAtControlPoint;

          // Move people from control point to area
          const availableAtControlPoint =
            newData.controlPoints[route.controlPoint] || 0;
          const toArea = Math.min(
            availableAtControlPoint,
            Math.floor(Math.random() * (isFastForward ? 300 : 30)) + 1
          );
          newData.controlPoints[route.controlPoint] -= toArea;
          newData.inTransit.toAreas[route.area] =
            (newData.inTransit.toAreas[route.area] || 0) + toArea;

          // Move people from in-transit to area
          if (!newData.areas[route.area]) {
            newData.areas[route.area] = {
              name: areas.find((a) => a.id == route.area)?.name,
              count: 0,
            };
          }
          const areaCapacity =
            parseInt(areas.find((a) => a.id == route.area)?.capacity) || 1000;
          const arrivedAtArea = Math.floor(
            (newData.inTransit.toAreas[route.area] || 0) *
              (isFastForward ? 0.98 : 0.9)
          );
          newData.inTransit.toAreas[route.area] -= arrivedAtArea;
          const newAreaCount = Math.min(
            newData.areas[route.area].count + arrivedAtArea,
            areaCapacity
          );
          newData.areas[route.area].count = newAreaCount;
        });

        // Recalculate totals
        newData.currentOccupancy = Object.values(newData.areas).reduce(
          (sum, area) => sum + area.count,
          0
        );
        newData.remainingCapacity = Math.max(
          0,
          parseInt(eventCapacity) - newData.currentOccupancy
        );

        // Check if we should end the fast forward
        const occupancyRate =
          (newData.currentOccupancy / parseInt(eventCapacity)) * 100;
        if (isFastForward) {
          const elapsedTime = Date.now() - fastForwardStartTime;
          if (elapsedTime >= 15000 || occupancyRate >= targetOccupancy) {
            // Force all in-transit people to their destinations
            Object.keys(newData.inTransit.toAreas).forEach((areaId) => {
              const areaCapacity =
                parseInt(areas.find((a) => a.id == areaId)?.capacity) || 1000;
              const arrivedAtArea = newData.inTransit.toAreas[areaId];
              newData.inTransit.toAreas[areaId] = 0;
              newData.areas[areaId].count = Math.min(
                newData.areas[areaId].count + arrivedAtArea,
                areaCapacity
              );
            });
            Object.keys(newData.inTransit.toControlPoints).forEach((cpId) => {
              newData.controlPoints[cpId] +=
                newData.inTransit.toControlPoints[cpId];
              newData.inTransit.toControlPoints[cpId] = 0;
            });
            Object.keys(newData.inTransit.atEntrances).forEach((entranceId) => {
              newData.entrances[entranceId] +=
                newData.inTransit.atEntrances[entranceId];
              newData.inTransit.atEntrances[entranceId] = 0;
            });

            setIsFastForward(false);
            setIsEventEnded(true);
            isSimulationRunning.current = false;
            clearInterval(interval);
          }
        }

        // Recalculate current occupancy after forcing in-transit people to destinations
        newData.currentOccupancy = Object.values(newData.areas).reduce(
          (sum, area) => sum + area.count,
          0
        );

        setOccupancyData((oldData) => {
          const newEntry = {
            time: new Date().toLocaleTimeString(),
            occupancy: newData.currentOccupancy,
          };
          const updatedData = [...oldData, newEntry].slice(-20);
          return updatedData;
        });

        return newData;
      });
    };

    if (isSimulationRunning.current) {
      interval = setInterval(runSimulation, simulationSpeed);

      if (isFastForward) {
        fastForwardStartTime = Date.now();
      }
    }

    return () => clearInterval(interval);
  }, [
    areas,
    entrances,
    controlPoints,
    routes,
    eventCapacity,
    isFastForward,
    isEventEnded,
    targetOccupancy,
  ]);

  const handleFastForward = useCallback(() => {
    setIsFastForward(true);
    isSimulationRunning.current = true;
  }, []);

  const validateAreaCapacities = () => {
    const totalAreaCapacity = areas.reduce(
      (sum, area) => sum + (parseInt(area.capacity) || 0),
      0
    );
    if (totalAreaCapacity > parseInt(eventCapacity)) {
      setError("Total area capacity exceeds event capacity");
    } else {
      setError("");
    }
  };

  useEffect(() => {
    validateAreaCapacities();
  }, [areas, eventCapacity]);

  if (!user || user.role !== "admin") {
    router.push("/login");
    return null;
  }

  const addItem = (type, setter) => {
    const newItem = { id: Date.now(), name: "", capacity: "" };
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

  const updateItem = (type, id, field, value) => {
    const setter =
      type === "area"
        ? setAreas
        : type === "entrance"
        ? setEntrances
        : setControlPoints;
    setter((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
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
    setError("");

    if (error) {
      setMessage("Please correct the errors before saving.");
      return;
    }

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

  const renderLiveDataDashboard = () => {
    const occupancyRate = eventCapacity
      ? Math.round((liveData.currentOccupancy / parseInt(eventCapacity)) * 100)
      : 0;
    const totalInTransit =
      Object.values(liveData.inTransit.atEntrances).reduce(
        (sum, count) => sum + count,
        0
      ) +
      Object.values(liveData.inTransit.toControlPoints).reduce(
        (sum, count) => sum + count,
        0
      ) +
      Object.values(liveData.inTransit.toAreas).reduce(
        (sum, count) => sum + count,
        0
      );

    return (
      <div className="bg-gray-800 shadow-2xl rounded-lg overflow-hidden border border-gray-700 p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-200 mb-6">
          Live Event Dashboard
        </h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">
            Occupancy Trend
          </h3>
          <div className="h-64 bg-gray-700 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                  labelStyle={{ color: "#D1D5DB" }}
                  itemStyle={{ color: "#60A5FA" }}
                />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Occupancy</p>
              <p className="text-2xl font-bold text-white">
                {liveData.currentOccupancy}
              </p>
            </div>
            <Users size={32} className="text-green-400" />
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Remaining Capacity</p>
              <p className="text-2xl font-bold text-white">
                {liveData.remainingCapacity}
              </p>
            </div>
            <Users size={32} className="text-yellow-400" />
          </div>
          <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Occupancy Rate</p>
              <p className="text-2xl font-bold text-white">{occupancyRate}%</p>
            </div>
            <Percent size={32} className="text-purple-400" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-200 mb-4">
          Area Occupancy
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.values(liveData.areas).map((area) => (
            <div key={area.name} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 font-semibold">{area.name}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xl font-bold text-white">{area.count}</p>
                <div className="w-2/3 bg-gray-600 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        (area.count /
                          (parseInt(
                            areas.find((a) => a.name === area.name)?.capacity
                          ) || 100)) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-gray-200 mb-4">
          Entrance Data (Total Passed)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {entrances.map((entrance) => (
            <div key={entrance.id} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 font-semibold">{entrance.name}</p>
              <p className="text-xl font-bold text-white">
                {liveData.entrances[entrance.id] || 0} passed
              </p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-gray-200 mb-4">
          Control Point Data (Total Passed)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {controlPoints.map((cp) => (
            <div key={cp.id} className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 font-semibold">{cp.name}</p>
              <p className="text-xl font-bold text-white">
                {liveData.controlPoints[cp.id] || 0} passed
              </p>
            </div>
          ))}
        </div>

        {!isEventEnded && (
          <button
            onClick={handleFastForward}
            disabled={isFastForward}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FastForward size={18} className="mr-2" />
            Fast Forward to {targetOccupancy}% Occupancy
          </button>
        )}

        {isEventEnded && (
          <div className="mt-8 p-4 bg-green-800 rounded-lg text-white">
            <h3 className="text-xl font-bold mb-2">Event Ended</h3>
            <p>Final Occupancy: {liveData.currentOccupancy}</p>
            <p>
              Occupancy Rate:{" "}
              {Math.round(
                (liveData.currentOccupancy / parseInt(eventCapacity)) * 100
              )}
              %
            </p>
            <h4 className="text-lg font-semibold mt-4 mb-2">Entrance Data:</h4>
            {entrances.map((entrance) => (
              <p key={entrance.id}>
                {entrance.name}: {liveData.entrances[entrance.id] || 0} passed
              </p>
            ))}
            <h4 className="text-lg font-semibold mt-4 mb-2">
              Control Point Data:
            </h4>
            {controlPoints.map((cp) => (
              <p key={cp.id}>
                {cp.name}: {liveData.controlPoints[cp.id] || 0} passed
              </p>
            ))}
            <h4 className="text-lg font-semibold mt-4 mb-2">Area Occupancy:</h4>
            {Object.values(liveData.areas).map((area) => (
              <p key={area.name}>
                {area.name}: {area.count} people
              </p>
            ))}
          </div>
        )}
      </div>
    );
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
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) =>
                  updateItem(type, item.id, "name", e.target.value)
                }
                placeholder={`${
                  type.charAt(0).toUpperCase() + type.slice(1)
                } name`}
                className="flex-grow px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-gray-200 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => removeItem(type, item.id)}
                className="text-red-400 hover:text-red-300 transition-colors p-2"
                title={`Remove ${type}`}
              >
                <XCircle size={20} />
              </button>
            </div>
            {type === "area" && (
              <input
                type="number"
                value={item.capacity}
                onChange={(e) =>
                  updateItem(type, item.id, "capacity", e.target.value)
                }
                placeholder="Capacity"
                className="w-[30%] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-gray-200 placeholder-gray-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Event Capacity
              </label>
              <input
                type="number"
                value={eventCapacity}
                onChange={(e) => setEventCapacity(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-200"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>{renderItemList("area", areas, setAreas)}</div>
              <div>{renderItemList("entrance", entrances, setEntrances)}</div>
              <div>
                {renderItemList(
                  "controlPoint",
                  controlPoints,
                  setControlPoints
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-200">
                Create Routes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                      >
                        <XCircle size={20} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 border-l-4 border-red-500 text-red-200 p-4 mb-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}

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
        {renderLiveDataDashboard()}
      </div>
    </div>
  );
}
