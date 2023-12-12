import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import '../styles/EditUser.css';

const EditUser = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const backendPort = process.env.REACT_APP_BACKEND_PORT || 3000;

    const [formData, setFormData] = useState({
        Display_Name: '',
        Username: '',
        Password: '',
        Profile_Pic: ''
    });

    useEffect(() => {
        // Update the formData state with user data when the component mounts
        if (user) {
            setFormData({
                Display_Name: user.Display_Name,
                Username: user.Username,
                Password: user.Password,
                Profile_Pic: user.Profile_Pic
            });
        }
    }, [user]);

    const onChange = (e) => {
        if (e.target.name === 'Profile_Pic' && e.target.files.length > 0) {
            const file = e.target.files[0];

            // Display the selected image before saving
            const reader = new FileReader();
            reader.onload = () => {
                setFormData({ ...formData, Profile_Pic: reader.result, profilePictureFile: file });
            };
            reader.readAsDataURL(file);
        } else {
            const updatedFormData = { ...formData, [e.target.name]: e.target.value };
            setFormData(updatedFormData);
        }
    };


    const onSave = async (e) => {
        e.preventDefault();

        const sendData = new FormData();
        sendData.append('display_name', formData.Display_Name);
        sendData.append('username', formData.Username);
        sendData.append('email', user.Email);
        sendData.append('password', formData.Password);

        if (formData.profilePictureFile) {
            sendData.append('profilePicture', formData.profilePictureFile);
        }

        try {
            const response = await fetch(`http://localhost:${backendPort}/user/edit/${user.User_ID}`, {
                method: 'PUT',
                body: sendData,
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                logout();
                navigate('/signin');
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error during fetch:', error);
        }
    };



    const onCancel = () => {
        // Implement the cancel action, e.g., redirect to a different page
        navigate('/search');
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 mx-auto">
                    <div className="card bg-white text-dark">
                        <div className="card-body">
                            <h1 className="text-center">Edit</h1> {/* Change "Register" to "Edit" here */}
                            <form onSubmit={(e) => onSave(e)}>
                                <div className="left-half">
                                    <label>
                                        Profile Picture:
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="Profile_Pic"
                                            onChange={(e) => onChange(e)}
                                        />
                                        {formData.Profile_Pic && <img src={formData.Profile_Pic} alt="Profile_Pic" />}
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>Display Name</label>
                                    <input type="text" name="Display_Name" value={formData.Display_Name} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input type="text" name="Username" value={formData.Username} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" name="Password" value={formData.Password} onChange={(e) => onChange(e)} required className="form-control" />
                                </div>
                                <p className="lead mt-4">Please Note: Relogin required after changing any data.</p>
                                <div className="text-center">
                                    <button type="submit" className="btn btn-primary mr-2">Save</button>
                                    <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditUser;
