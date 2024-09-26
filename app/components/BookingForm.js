"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import TrainResults from './TrainResults';

export default function BookingForm() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsSnapshot = await getDocs(collection(db, 'stations'));
        const stationsData = stationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStations(stationsData);
      } catch (error) {
        console.error("Error fetching stations:", error);
        toast({
          title: "Error",
          description: "Failed to fetch stations",
          variant: "destructive",
        });
      }
    };

    fetchStations();
  }, [toast]);

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : '';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const trainsSnapshot = await getDocs(collection(db, 'trains'));
      const allTrains = trainsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("All trains:", allTrains);

      const selectedDay = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      console.log("Selected day:", selectedDay);
      console.log("Source ID:", source, "Destination ID:", destination);

      const trainsData = allTrains.filter(train =>
        train.source === source &&
        train.destination === destination &&
        train.running_days.includes(selectedDay)
      );
      console.log("Filtered trains:", trainsData);

      setTrains(trainsData);
    } catch (error) {
      console.error("Error searching trains:", error);
      toast({
        title: "Error",
        description: "Failed to search trains",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="source">From</Label>
            <Select onValueChange={setSource} required>
              <SelectTrigger>
                <SelectValue placeholder="Select source station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="destination">To</Label>
            <Select onValueChange={setDestination} required>
              <SelectTrigger>
                <SelectValue placeholder="Select destination station" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="date">Date of Journey</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Searching..." : "Search Trains"}
        </Button>
      </form>
      {trains.length > 0 ? (
        <TrainResults trains={trains} />
      ) : (
        loading ? (
          <p>Searching for trains...</p>
        ) : (
          trains.length === 0 && <p>No trains found for the selected route and date.</p>
        )
      )}
    </div>
  );
}
