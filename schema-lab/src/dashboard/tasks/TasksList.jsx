import React, { useState, useEffect, useContext, createContext } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import { Tooltip, OverlayTrigger, Dropdown, DropdownButton, Button, Alert } from 'react-bootstrap';

import { faArrowDownAZ, faArrowDownZA } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Table from "react-bootstrap/Table";
import { useTaskData, useTaskFilters } from "./TasksListProvider";
import { cloneDeep } from "lodash";
import  TaskStatus  from "./TaskStatus"
import { cancelTaskPost } from "../../api/v1/actions"
import { UserDetailsContext } from "../../utils/components/auth/AuthProvider";

export const TaskDetailsContext = createContext();


const TaskListing = ({ uuid, status, submitted_at, updated_at, isSelected, toggleSelection }) => {
    const { userDetails } = useContext(UserDetailsContext);
    const [alertMessage, setAlertMessage] = useState(null);
    const [isAlertActive, setIsAlertActive] = useState(false);

    const handleCheckboxChange = () => {
        toggleSelection(uuid);
    };

    const handleCancelTask = (taskUUID, auth) => {
        cancelTaskPost({ taskUUID, auth })
            .then(response => {
                if (!response.ok) {
                    setAlertMessage(`Canceling ${taskUUID} failed! Please try again.`);
                    setIsAlertActive(true);
                    setTimeout(() => {
                        setAlertMessage(null);
                        setIsAlertActive(false);
                    }, 1000);
                }
            });
    };

    return (
        <>
            {isAlertActive ? (
                <tr>
                    <td colSpan="5">
                        <Alert variant="danger" dismissible>
                            {alertMessage}
                        </Alert>
                    </td>
                </tr>
            ) : (
                <tr className={isSelected ? 'table-active' : ''}>
                    <td>
                        <input className="form-check-input" type="checkbox" checked={isSelected} onChange={handleCheckboxChange} />
                    </td>
                    <td><Link to={`/task-details/${uuid}/executors`}>{uuid}</Link></td>
                    <td><TaskStatus status={status} /></td>
                    <td>{new Date(submitted_at).toLocaleString('en')}</td>
                    <td>{new Date(updated_at).toLocaleString('en')}</td>
                    <td>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCancelTask(uuid, userDetails.apiKey)}
                        >
                            Cancel
                        </Button>
                    </td>
                </tr>
            )}
        </>
    );
};

const ColumnOrderToggle = ({ columnName, currentOrder, setOrder }) => {
    const active = currentOrder && currentOrder.endsWith(columnName);
    const asc = currentOrder && !currentOrder.startsWith("-");
    const icon = active && !asc ? faArrowDownZA : faArrowDownAZ;

    const handleSwitchOrder = () => {
        if (active && asc) {
            setOrder(`-${columnName}`);
            return;
        }
        setOrder(columnName);
    };

    return (
        <span
            role="button"
            className={"fw-bold" + (active ? " text-primary" : " text-muted")}
            onClick={handleSwitchOrder}
        >
            <FontAwesomeIcon icon={icon} />
        </span>
    );
};

const TaskList = () => {
    const { taskData } = useTaskData();
    const { taskFilters, setTaskFilters } = useTaskFilters();
    const [token, setToken] = useState(taskFilters.token);
    const [statuses, setStatuses] = useState({ ...(taskFilters.statuses) });
    const [typedChar, setTypedChar] = useState();
    const [showValidationMessage, setShowValidationMessage] = useState(false); // State for managing validation message visibility
    const [selectedRows, setSelectedRows] = useState([]);

    const minCharThreshold = 2; // The minimum amount of characters to apply a filter

    const orderBy = taskFilters.order;
    const setOrderBy = (attribute) => {
        const newTaskFilters = cloneDeep(taskFilters);
        newTaskFilters.order = attribute;
        setTaskFilters(newTaskFilters);
    };

    const handleNameInput = (evt) => {
        setToken(evt.target.value);
    };

    const restoreFilters = (evt) => {
        setShowValidationMessage(false);
        if (evt.key !== 'Enter') {
            setTypedChar(evt.target.value.length);
        }
        // on empty token restore filters
        if (evt.target.value === "") {
            setTaskFilters({ ...taskFilters, token: "", statuses: {} });
        }
    };

    // Get filtered task elements on Enter pushed
    const handleApplyFilters = (event) => {
        // Apply filter on Enter key pushed and two characters have typed
        if (event.key === 'Enter') {
            if (typedChar >= minCharThreshold) {
                setShowValidationMessage(false); // Hide validation message if condition is met
                setTaskFilters({
                    ...taskFilters,
                    token,
                    statuses: { ...statuses },
                    page: 0 // Always render first page of filtering results
                });
            } else {
                // Block accepting filtering keywords less than 2 chars
                setShowValidationMessage(true); // Show validation message if condition is not met
            }
        }
    };

    const handleStatusChange = (status) => {
        
        let newStatuses = {}; // Initialize an empty object to reset statuses
        if (status !== 'all') {
            newStatuses = { [status]: status };
        }
        setStatuses(newStatuses);
        setTaskFilters({
            ...taskFilters,
            token,
            statuses: newStatuses 
        });
    
    };

    // Get the amount of filtered elements found
    const findFilteredTokens = () => {
        if (taskData) {
            const { count } = taskData;
            if (count === 0) {
                return (
                    <div className="alert alert-warning text-center" role="alert">
                        Your search <b>{token}</b> did not match any task!
                    </div>
                );
            }
        } else {
            return null;
        }
    };

    const toggleRowSelection = (uuid) => {
        let updatedSelectedRows;
        if (selectedRows.includes(uuid)) {
            updatedSelectedRows = selectedRows.filter(id => id !== uuid);
        } else {
            updatedSelectedRows = [...selectedRows, uuid];
        }
        setSelectedRows(updatedSelectedRows);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const allUuids = taskData.results.map(task => task.uuid);
            setSelectedRows(allUuids);
        } else {
            setSelectedRows([]);
        }
    };
    
    return (
        <Row className="p-3 mb-5">
            <Col className="align-items-center">
                {taskData && taskData.results && (
                    <Table borderless responsive hover>
                        <thead>
                            <tr>
                                <th>
                                    <input className="form-check-input" type="checkbox" onChange={handleSelectAll} />
                                </th>
                                <th className="col-4">
                                    <div className="input-group">
                                        <span className="input-group-text fw-bold" id="search">
                                            Name/UUID&nbsp;
                                            <ColumnOrderToggle columnName={"uuid"} currentOrder={orderBy} setOrder={setOrderBy} />
                                        </span>
                                        <OverlayTrigger
                                            placement="bottom"
                                            show={showValidationMessage}
                                            overlay={
                                                <Tooltip id="tooltip-right">
                                                    Please type at least two characters!
                                                </Tooltip>
                                            }
                                        >
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search..."
                                                aria-label="search"
                                                aria-describedby="search-box"
                                                value={token}
                                                onInput={handleNameInput}
                                                onKeyDown={handleApplyFilters}
                                                onChange={restoreFilters}
                                            />
                                        </OverlayTrigger>
                                    </div>
                                </th>
                                <th>
                                    <DropdownButton
                                        id="dropdown-basic-button"
                                        variant='light'
                                        title={
                                            <>
                                                <span className="fw-bold">Status</span>
                                            </>
                                        }
                                        onSelect={handleStatusChange}
                                    >   
                                        <Dropdown.Item eventKey='all'><TaskStatus status='ALL' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='submitted'><TaskStatus status='SUBMITTED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='approved'><TaskStatus status='APPROVED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='scheduled'><TaskStatus status='SCHEDULED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='running'><TaskStatus status='RUNNING' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='completed'><TaskStatus status='COMPLETED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='error'><TaskStatus status='ERROR' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='canceled'><TaskStatus status='CANCELED' /></Dropdown.Item>
                                        <Dropdown.Item eventKey='rejected'><TaskStatus status='REJECTED' /></Dropdown.Item>
                                    </DropdownButton>
                                </th>
                                <th>
                                    Submission time <ColumnOrderToggle columnName={"submitted_at"} currentOrder={orderBy} setOrder={setOrderBy} />
                                </th>
                                <th>Update time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {taskData.results.map((task) => (
                                <TaskListing
                                    key={task.uuid}
                                    uuid={task.uuid}
                                    status={task.state.status}
                                    submitted_at={task.submitted_at}
                                    updated_at={task.state.updated_at}
                                    isSelected={selectedRows.includes(task.uuid)}
                                    toggleSelection={toggleRowSelection}
                                />
                            ))}
                        </tbody>
                    </Table>
                )}
            </Col>
            {findFilteredTokens()}
        </Row>
    );
};

export default TaskList;
