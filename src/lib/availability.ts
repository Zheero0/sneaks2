
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';
import { parseISO } from 'date-fns';

const availabilityCollection = collection(db, 'availability');

// Get available slots for a specific date
export const getAvailability = async (date: string): Promise<string[]> => {
  const docRef = doc(availabilityCollection, date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return (docSnap.data().slots || []).sort();
  } else {
    return [];
  }
};

// Add a new time slot to a specific date
export const addAvailability = async (date: string, time: string): Promise<boolean> => {
  const docRef = doc(availabilityCollection, date);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        slots: arrayUnion(time)
      });
    } else {
      await setDoc(docRef, { slots: [time] });
    }
    return true;
  } catch (error) {
    console.error("Error adding availability: ", error);
    return false;
  }
};

// Remove a time slot from a specific date
export const removeAvailability = async (date: string, time: string): Promise<boolean> => {
  const docRef = doc(availabilityCollection, date);
  try {
    await updateDoc(docRef, {
      slots: arrayRemove(time)
    });
    return true;
  } catch (error) {
    console.error("Error removing availability: ", error);
    return false;
  }
};


// Get all dates that have available slots
export const getAvailableDates = async (): Promise<Date[]> => {
    try {
        const querySnapshot = await getDocs(availabilityCollection);
        const dates: Date[] = [];
        querySnapshot.forEach(doc => {
            // Check if the document has a 'slots' field and if it's a non-empty array
            const data = doc.data();
            if (Array.isArray(data.slots) && data.slots.length > 0) {
                try {
                    // The doc.id is the date string 'yyyy-MM-dd'
                    const date = parseISO(doc.id); 
                    dates.push(date);
                } catch (e) {
                    console.error(`Invalid date format for doc id: ${doc.id}`);
                }
            }
        });
        return dates;
    } catch (error) {
        console.error("Error fetching available dates: ", error);
        return [];
    }
};
