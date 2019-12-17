package online.eoodin.shelf.model;

public class LoginUserProfile {
    private String csrf;
    private ShelfUser user;

    public String getCsrf() {
        return csrf;
    }

    public void setCsrf(String csrf) {
        this.csrf = csrf;
    }

    public ShelfUser getUser() {
        return user;
    }

    public void setUser(ShelfUser user) {
        this.user = user;
    }
}
