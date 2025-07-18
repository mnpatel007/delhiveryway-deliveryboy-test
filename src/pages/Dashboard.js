import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io(process.env.REACT_APP_BACKEND_URL);

const Dashboard = () => {
    const { deliveryBoy, logout } = useContext(AuthContext);
    const [assigned, setAssigned] = useState(null);
    const [pendingPopup, setPendingPopup] = useState(null);

    useEffect(() => {
        if (deliveryBoy) {
            socket.emit('registerDelivery', deliveryBoy.deliveryBoy._id);
        }

        socket.on('newDeliveryAssignment', (payload) => {
            if (!assigned) setPendingPopup(payload);
        });

        return () => {
            socket.off('newDeliveryAssignment');
        };
    }, [deliveryBoy, assigned]);

    const handleAccept = () => {
        setAssigned(pendingPopup);
        setPendingPopup(null);
        // Optionally notify backend about assignment
    };

    return (
        <div>
            <h2>Welcome, {deliveryBoy?.deliveryBoy?.name}</h2>
            <button onClick={logout}>Logout</button>

            {pendingPopup && !assigned && (
                <div className="modal">
                    <h3>New Delivery Assignment</h3>
                    <p><strong>Earn:</strong> ₹{pendingPopup.earnAmount}</p>
                    <p><strong>To:</strong> {pendingPopup.address}</p>
                    <p><strong>Items:</strong> {pendingPopup.items.length}</p>
                    <button onClick={handleAccept}>Accept Delivery</button>
                </div>
            )}

            {assigned && (
                <div>
                    <h3>📦 Assigned Delivery</h3>
                    <p><strong>Address:</strong> {assigned.address}</p>
                    <p><strong>Shop:</strong> {assigned.shopDetails?.name}</p>
                    <p><strong>Earn:</strong> ₹{assigned.earnAmount}</p>
                    <ul>
                        {assigned.items.map((item, i) => (
                            <li key={i}>
                                Product ID: {item.productId} × {item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
