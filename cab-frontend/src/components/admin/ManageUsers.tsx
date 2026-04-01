import React, { useState, useEffect, useRef } from 'react';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../service/AdminService';
import { Employee } from '../interface';
import { getStoredUser } from '../../service/AuthService';
import './cab.css';

const ManageUsers: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [viewMode, setViewMode] = useState<'Pagination' | 'Loadmore'>('Pagination');
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Partial<Employee>>({});
    const [isEditing, setIsEditing] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const limit = 10;
    const user = getStoredUser();
    const isAdmin = user?.role === 'Admin' || user?.role === 'ADMIN';
    const totalPages = Math.ceil(totalCount / limit);

    function useDebounce<T>(value: T, delay = 500): T {
        const [debounced, setDebounced] = useState(value);

        useEffect(() => {
            const timer = setTimeout(() => setDebounced(value), delay);
            return () => clearTimeout(timer);
        }, [value, delay]);

        return debounced;
    }
    const debouncedSearch = useDebounce(search, 500);

    async function loadEmployees(isLoadMore = false) {
        setLoading(true);
        try {
            const data = await fetchEmployees(debouncedSearch, page, limit);
            if (isLoadMore) {
                setEmployees(prev => [...prev, ...data.employee]);
            } else {
                setEmployees(data.employee);
            }
            setTotalCount(data.totalcount);
        } catch (error) {
            console.error("Failed to fetch employees", error);
            alert("Error fetching employees");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        if (viewMode === 'Pagination') {
            loadEmployees(false);
        } else if (viewMode === 'Loadmore' && page === 1) {
            loadEmployees(false);
        } else if (viewMode === 'Loadmore' && page > 1) {
            loadEmployees(true);
        }
    }, [debouncedSearch, page, viewMode]);

    /* -------------------- */
    /* IntersectionObserver */
    /* -------------------- */
    useEffect(() => {
        if (viewMode !== "Loadmore") return;
        if (!loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            entries => {
                if (
                    entries[0].isIntersecting &&
                    !loading &&
                    page < totalPages
                ) {
                    setPage(p => p + 1);
                }
            },
            { rootMargin: "100px" }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [viewMode, loading, page, totalPages]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleAdd = () => {
        if (!isAdmin) return alert("Only admins can perform this action");
        setCurrentEmployee({ name: '', phone: '', email: '', address: '' });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        if (!isAdmin) return alert("Only admins can perform this action");
        setCurrentEmployee(employee);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!isAdmin) return alert("Only admins can perform this action");
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await deleteEmployee(id);
                setEmployees(prev =>
                    prev.filter(emp => emp.id !== id)
                );
                setPage(1);
            } catch (error) {
                alert("Failed to delete employee");
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentEmployee.id) {
                await updateEmployee(currentEmployee.id, currentEmployee as Employee);
                setEmployees(prev =>
                    prev.map(emp =>
                        emp.id === currentEmployee.id
                            ? { ...emp, ...currentEmployee }
                            : emp
                    )
                );
            } else {
                await createEmployee(currentEmployee as Omit<Employee, 'id'>);
            }
            setIsModalOpen(false);
            setPage(1);
        } catch (error) {
            alert("Failed to save employee");
        }
    };


    return (
        <div className="admin-container">
            <h1 className="dashboard-title">Manage Employees</h1>

            <div className="grid-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="view-toggle">
                    <button
                        className={viewMode === 'Pagination' ? 'active' : ''}
                        onClick={() => { setViewMode('Pagination'); setPage(1); }}
                    >
                        Pagination
                    </button>   
                    <button
                        className={viewMode === 'Loadmore' ? 'active' : ''}
                        onClick={() => { setViewMode('Loadmore'); setPage(1); }}
                    >
                        Load More
                    </button>
                </div>

                {isAdmin && (
                    <button className="add-btn" onClick={handleAdd}>+ Add Employee</button>
                )}
            </div>

            <div className="section" style={{ width: '100%', boxSizing: 'border-box' }}>
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Address</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td>{emp.id}</td>
                                <td>{emp.name}</td>
                                <td>{emp.email}</td>
                                <td>{emp.phone}</td>
                                <td>{emp.address}</td>
                                {isAdmin && (
                                    <td>
                                        <button className="action-btn edit-btn" onClick={() => handleEdit(emp)}>Edit</button>
                                        <button className="action-btn delete-btn" onClick={() => emp.id && handleDelete(emp.id)}>Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {employees.length === 0 && !loading && (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center' }}>No employees found</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {viewMode === 'Pagination' && totalPages > 1 && (
                    <div className="pagination">
                        <button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button>
                        <span>Page {page} of {totalPages} ({totalCount} total)</span>
                        <button disabled={page === totalPages || loading} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                )}

                {viewMode === "Loadmore" && <div ref={loadMoreRef} />}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    required
                                    value={currentEmployee.name || ''}
                                    onChange={e => setCurrentEmployee({ ...currentEmployee, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={currentEmployee.email || ''}
                                    onChange={e => setCurrentEmployee({ ...currentEmployee, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    required
                                    value={currentEmployee.phone || ''}
                                    onChange={e => setCurrentEmployee({ ...currentEmployee, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    required
                                    value={currentEmployee.address || ''}
                                    onChange={e => setCurrentEmployee({ ...currentEmployee, address: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
