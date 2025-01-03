import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import emailjs from "@emailjs/browser";
import "./signup.css";

type SignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
};

const Signup = () => {
  const [data, setData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "local", // Default value
  });
  const [error, setError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const url = `http://172.20.10.3:8082/api/signup`;
      const { data: res } = await axios.post(url, data);

      await emailjs.send(
        "service_061uyjc",
        "template_qejy7ja",
        { to_email: data.email },
        "Ac1RL4TgJZVZgpMSY"
      );
      window.location.href = "/login";
      console.log("User created successfully:", res.message);
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message);
      } else {
        console.error("An unexpected error occurred:", error.message);
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-frame">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={data.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={data.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={data.confirmPassword}
            onChange={handleChange}
            required
          />
          <select name="role" value={data.role} onChange={handleChange}>
            <option value="local">Local Resident</option>
            <option value="emergency">Emergency Responder</option>
          </select>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-btn">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
