import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Attempting to fetch stations...');
    const stationsCollectionRef = collection(db, 'stations');
    const querySnapshot = await getDocs(stationsCollectionRef);

    if (querySnapshot.empty) {
      console.warn('No stations found in the database.');
      return Response.json({ error: 'No stations available' }, { status: 404 });
    }

    const stations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Successfully fetched ${stations.length} stations.`);
    return Response.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    if (error.code === 'unavailable') {
      return Response.json({ error: 'Service temporarily unavailable. Please try again later.' }, { status: 503 });
    }
    if (error.code === 'not-found') {
      return Response.json({ error: 'Stations collection not found. Please check your database structure.' }, { status: 404 });
    }
    return Response.json({ error: 'Failed to fetch stations', details: error.message }, { status: 500 });
  }
}
