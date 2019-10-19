enum MESSAGES {
    STORAGE_ENTITY_NAME_OCCUPIED = 'This name already exists in storage',
    STORAGE_WRONG_FORMAT = 'Collection in storage has wrong format. Someone has probably changed it',
    RECORD_WRONG_WRITE_ARGS = 'Wrong arguments for write operation',
    UPDATE_WRONG_ARGUMENTS = 'Arguments for update operation are insufficient. You either have to specify id/ids/query with payload or specify the exact item/items containing id and fields to update',
    QUERY_WRONG_OPERATION = 'Wrong query operation. __gt, __lt, __gte, __lte are allowed only on numbers and strings'
}

export default MESSAGES;
