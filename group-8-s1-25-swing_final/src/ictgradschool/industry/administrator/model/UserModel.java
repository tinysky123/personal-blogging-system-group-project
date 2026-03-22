package ictgradschool.industry.administrator.model;

import ictgradschool.industry.administrator.entity.User;

import javax.swing.table.AbstractTableModel;
import java.util.ArrayList;
import java.util.List;

public class UserModel extends AbstractTableModel {
    private List<User> users = new ArrayList<>();
    private String[] columnNames = {"USERNAME", "REALNAME", "BIRTHDATE", "FOLLOWERS"};

    @Override
    public int getRowCount() {
        return users.size();
    }

    @Override
    public int getColumnCount() {
        return columnNames.length;
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        User user = users.get(rowIndex);
        switch (columnIndex) {
            case 0:
                return user.getUsername();
            case 1:
                return user.getRealName();
            case 2:
                return user.getDob();
            case 3:
                return user.getFollowers();
            default:
                return null;
        }
    }

    @Override
    public String getColumnName(int column) {
        return columnNames[column];
    }

    public void setUsers(List<User> users) {
        this.users = users;
        fireTableDataChanged();
    }

    public void clearUsers() {
        users.clear();
        fireTableDataChanged();
    }

    public void removeUser(int row) {
        users.remove(row);
        fireTableRowsDeleted(row, row);
    }

    public User getUserAt(int row) {
        return users.get(row);
    }
}