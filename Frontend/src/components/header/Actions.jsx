// src/components/header/Actions.jsx
import React from "react";
import { Link } from "react-router-dom"; // ✅ correct
import { Bell, Search } from "lucide-react";
import useAuth from "../../auth/useAuth";
import UserMenu from "./UserMenu";
export default function Actions({ onMobileSearch, showSearch = true }) {
  return (
    <div className="flex items-center gap-2">
      {showSearch && (
        <button
          onClick={onMobileSearch}
          className="..."
          aria-label="Search"
          type="button"
        >
          {/* Search Icon */}
        </button>
      )}

      {/* ✅ Profile button should remain always */}
      <UserMenu/>
    </div>
  );
}