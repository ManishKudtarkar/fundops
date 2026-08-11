import { useEffect, useState } from "react";
import api from "../services/api";
import type { User } from "../types";

export default function Employees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchEmployees = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/employees?page=${pageNum}&limit=${limit}`
      );
      setEmployees(response.data.data.items || []);
      setTotal(response.data.data.pagination?.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Employees</h1>
        <p>Manage your team members</p>
        <button className="btn btn-primary">+ Add Employee</button>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading employees...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.email}</td>
                    <td>
                      <span className="badge badge-info">{employee.role}</span>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          employee.isActive ? "success" : "warning"
                        }`}
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary">Edit</button>
                      <button className="btn btn-sm btn-secondary">
                        Reset Password
                      </button>
                      <button className="btn btn-sm btn-danger">Remove</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
