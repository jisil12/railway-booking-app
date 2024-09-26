import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function TrainResults({ trains }) {
  const router = useRouter();

  const handleSelectFare = (trainId, className, fare) => {
    router.push(`/booking/${trainId}?class=${className}&fare=${fare}`);
  };

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-3xl font-bold text-center">Available Trains</h2>
      {trains.map((train) => (
        <Card key={train.id} className="hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex justify-between items-center text-2xl">
              <span>{train.name} ({train.id})</span>
              <Badge className="bg-white text-blue-600 text-lg px-3 py-1">{train.duration}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="font-semibold text-lg text-gray-600">Departure</p>
                <p className="text-xl">{train.departure_time}</p>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-600">Arrival</p>
                <p className="text-xl">{train.arrival_time}</p>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-600">Classes</p>
                <p className="text-xl">{train.classes.join(', ')}</p>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-600">Running Days</p>
                <p className="text-xl">{train.running_days.join(', ')}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-xl mb-3 text-gray-700">Fares</p>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(train.fare).map(([className, fare]) => (
                  <Button
                    key={className}
                    variant="outline"
                    className="justify-between text-lg py-3 hover:bg-blue-50"
                    onClick={() => handleSelectFare(train.id, className, fare)}
                  >
                    <span>{className}</span>
                    <span className="font-bold">₹{fare}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
