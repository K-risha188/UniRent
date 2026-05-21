async function verifyBackend() {
    const BASE_URL = 'http://localhost:5000/api';
    const timestamp = Date.now();

    async function safeFetch(url, options) {
        console.log(`Fetching: ${url} ...`);
        const res = await fetch(url, options);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON. Response start:', text.substring(0, 100));
            throw new Error(`Non-JSON response from ${url}`);
        }
    }

    try {
        console.log('--- Debugging Backend Verification ---');

        // 1. Owner
        const ownerData = await safeFetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Owner_${timestamp}`,
                email: `owner_${timestamp}@paruluniversity.ac.in`,
                password: 'password123',
                university: 'Parul University',
                idCardImage: 'id.jpg'
            })
        });
        const ownerToken = ownerData.token;

        // 2. Renter
        const renterData = await safeFetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Renter_${timestamp}`,
                email: `renter_${timestamp}@paruluniversity.ac.in`,
                password: 'password123',
                university: 'Parul University',
                idCardImage: 'id.jpg'
            })
        });
        const renterToken = renterData.token;

        // 3. Item
        const item = await safeFetch(`${BASE_URL}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
            body: JSON.stringify({
                title: 'Verification Gear',
                description: 'Test Description',
                pricePerDay: 100,
                securityDeposit: 500,
                category: 'Electronics',
                university: 'Parul University',
                images: ['http://img.com']
            })
        });
        const itemId = item._id;

        // 4. Booking
        const booking = await safeFetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${renterToken}` },
            body: JSON.stringify({
                itemId,
                startDate: new Date().toISOString(),
                endDate: new Date(Date.now() + 86400000).toISOString()
            })
        });
        const bookingId = booking._id;

        // 5. Approve
        await safeFetch(`${BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
            body: JSON.stringify({ status: 'approved' })
        });

        // 6. Pre-rental
        await safeFetch(`${BASE_URL}/bookings/${bookingId}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${renterToken}` },
            body: JSON.stringify({ type: 'preRental', photos: ['p1'], notes: 'start' })
        });

        // 7. Request Return
        await safeFetch(`${BASE_URL}/bookings/${bookingId}/request-return`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${renterToken}` }
        });

        // 8. Post-rental
        await safeFetch(`${BASE_URL}/bookings/${bookingId}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` },
            body: JSON.stringify({ type: 'postRental', photos: ['p2'], notes: 'end' })
        });

        // 9. History
        const history = await safeFetch(`${BASE_URL}/bookings/item/${itemId}/history`, {
            method: 'GET'
        });

        console.log('--- VERIFICATION SUCCESSFUL ---');
        console.log('History Entries:', history.length);

    } catch (e) {
        console.error('Terminated early:', e.message);
    }
}

verifyBackend();
