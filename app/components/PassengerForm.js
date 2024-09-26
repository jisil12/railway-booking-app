"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PassengerForm({ onSubmit }) {
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: '' }]);

  const handleAddPassenger = () => {
    setPassengers([...passengers, { name: '', age: '', gender: '' }]);
  };

  const handleRemovePassenger = (index) => {
    const newPassengers = [...passengers];
    newPassengers.splice(index, 1);
    setPassengers(newPassengers);
  };

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    setPassengers(newPassengers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(passengers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center mb-6">Passenger Details</h2>
      {passengers.map((passenger, index) => (
        <div key={index} className="space-y-4 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-xl font-semibold text-blue-700">Passenger {index + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`name-${index}`} className="text-lg">Name</Label>
              <Input
                id={`name-${index}`}
                value={passenger.name}
                onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                required
                className="mt-1"
                placeholder="Enter passenger name"
              />
            </div>
            <div>
              <Label htmlFor={`age-${index}`} className="text-lg">Age</Label>
              <Input
                id={`age-${index}`}
                type="number"
                value={passenger.age}
                onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                required
                className="mt-1"
                placeholder="Enter age"
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`gender-${index}`} className="text-lg">Gender</Label>
            <Select
              onValueChange={(value) => handlePassengerChange(index, 'gender', value)}
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {passengers.length > 1 && (
            <Button type="button" variant="destructive" onClick={() => handleRemovePassenger(index)} className="mt-2">
              Remove Passenger
            </Button>
          )}
        </div>
      ))}
      <div className="flex justify-between items-center">
        <Button type="button" onClick={handleAddPassenger} variant="outline" className="text-lg">
          Add Passenger
        </Button>
        <Button type="submit" className="text-lg px-6 py-3">
          Proceed to Payment
        </Button>
      </div>
    </form>
  );
}
