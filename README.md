# todo-backend
A user specific to-do list using MEAN stack

# TODO
- [ ] user 
  - [x] signup
  - [x] login
- [ ] event
  - [x] create
    - [x] event: contains task, label, status, due date
    - [x] list of label
    - [x] list of status
  - [ ] update
    - [ ] event
      - [ ] update task, label, status, or due date of a particular event
  - [ ] read
    - [ ] events of a particular user
    - [ ] list of labels of a particular user
    - [ ] list of status of a particular user
  - [ ] delete
    - [ ] an event
    - [ ] a particular label or status (?)

# notes
- validation error (required) eg. email and password must be taken care in the frontend.

# queries
- what happens when label or status which are used in an event, are deleted?
- updating label or status functionality? doesn't seem practical
- search and sort in front-end.