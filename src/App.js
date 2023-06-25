import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
let backendURL = "http://localhost:3001/";

function App() {
  const [contacts, setContacts] = useState([]);
  const [editingContactId, setEditingContactId] = useState(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone_number: "",
    email: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");

  // Fetch contacts data from the API
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(backendURL);
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewContact({ ...newContact, [e.target.name]: e.target.value });
  };

  const addContact = async (e) => {
    e.preventDefault();
    try {
      const now = new Date();
      const newContactWithTime = {
        ...newContact,
        createdAt: now.toISOString(),
      };
      const response = await fetch(backendURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContactWithTime),
      });

      if (response.ok) {
        setNewContact({
          name: "",
          phone_number: "",
          email: "",
        });
        fetchContacts();
        Swal.fire({
          title: "Success",
          text: "Contact added successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteContact = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Deletion",
        text: "Are you sure you want to delete this contact?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        const response = await fetch(backendURL + id, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchContacts();
          Swal.fire("Deleted!", "Contact has been deleted.", "success");
        } else {
          console.error("Error:", response.statusText);
          Swal.fire(
            "Error",
            "An error occurred while deleting the contact.",
            "error"
          );
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "email") {
      return a.email.localeCompare(b.email);
    } else if (sortBy === "time") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return 0;
    }
  });

  const editContact = async (id) => {
    setEditingContactId(id);
  };

  const cancelEdit = () => {
    setEditingContactId(null);
  };

  const saveContact = async (contact) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Save",
        text: "Are you sure you want to save the changes?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const updatedContact = {
          ...contact,
          lastUpdated: new Date().toISOString(),
        };
        const response = await fetch(backendURL + contact.id, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedContact),
        });

        if (response.ok) {
          setEditingContactId(null);
          fetchContacts();
        } else {
          console.error("Error:", response.statusText);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  function formatDateTime(timestamp) {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };

    const dateTime = new Date(timestamp).toLocaleString("en-US", options);
    return dateTime;
  }
  return (
    <div className="container py-4">
      <h1 className="mb-4 bg-primary text-white p-2">Contact Manager</h1>
      <div className="d-flex mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
        />
        <select className="form-select" value={sortBy} onChange={handleSort}>
          <option value="">Sort by</option>
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="time">Time</option>
        </select>
      </div>
      <form onSubmit={addContact} className="mb-3">
        <div className="row">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Name"
              name="name"
              value={newContact.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Phone Number"
              name="phone_number"
              value={newContact.phone_number}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              className="form-control mb-2"
              placeholder="Email"
              name="email"
              value={newContact.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-2">
          Add Contact
        </button>
      </form>
      <ul className="list-group">
        {sortedContacts.map((contact) => (
          <li className="list-group-item" key={contact.id}>
            {editingContactId === contact.id ? (
              <div>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={contact.name}
                  onChange={(e) =>
                    setContacts(
                      contacts.map((c) =>
                        c.id === contact.id ? { ...c, name: e.target.value } : c
                      )
                    )
                  }
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  value={contact.phone_number}
                  onChange={(e) =>
                    setContacts(
                      contacts.map((c) =>
                        c.id === contact.id
                          ? { ...c, phone_number: e.target.value }
                          : c
                      )
                    )
                  }
                />
                <input
                  type="email"
                  className="form-control mb-2"
                  value={contact.email}
                  onChange={(e) =>
                    setContacts(
                      contacts.map((c) =>
                        c.id === contact.id
                          ? { ...c, email: e.target.value }
                          : c
                      )
                    )
                  }
                />
                <button
                  className="btn btn-success me-2"
                  onClick={() => saveContact(contact)}
                >
                  Save
                </button>
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <strong>Name:</strong> {contact.name}
                <br />
                <strong>Phone:</strong> {contact.phone_number}
                <br />
                <strong>Email:</strong> {contact.email}
                <br />
                <strong>Time:</strong> {formatDateTime(contact.createdAt)}
                <br />
                {contact.lastUpdated && (
                  <div>
                    <strong>Last Updated:</strong>
                    {formatDateTime(contact.lastUpdated)}
                    <br />
                  </div>
                )}
                <button
                  className="btn btn-primary mt-2 me-2"
                  onClick={() => editContact(contact.id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger mt-2"
                  onClick={() => deleteContact(contact.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
