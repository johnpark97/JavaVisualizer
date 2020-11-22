package data;

import java.util.List;

public class JavaMethod {
    String returnType;
    String name;
    Boolean isConstructor;
    List<String> modifiers;
    List<JavaParameter> parameterList;

    public JavaMethod(String returnType, String name,Boolean b, List<String> modifiers, List<JavaParameter> parameterList) {
        this.returnType = returnType;
        this.name = name;
        this.isConstructor = b;
        this.modifiers = modifiers;
        this.parameterList = parameterList;
    }

    public String getReturnType() {
        return returnType;
    }

    public void setReturnType(String returnType) {
        this.returnType = returnType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getConstructor() {
        return isConstructor;
    }

    public void setConstructor(Boolean constructor) {
        isConstructor = constructor;
    }

    public List<String> getModifiers() {
        return modifiers;
    }

    public void setModifiers(List<String> modifiers) {
        this.modifiers = modifiers;
    }

    public List<JavaParameter> getParameterList() {
        return parameterList;
    }

    public void setParameterList(List<JavaParameter> parameterList) {
        this.parameterList = parameterList;
    }
}
