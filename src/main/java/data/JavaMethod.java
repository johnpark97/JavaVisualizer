package data;

import com.github.javaparser.ast.NodeList;
import com.github.javaparser.ast.stmt.Statement;

import java.util.List;

public class JavaMethod {
    String returnType;
    String name;
    Boolean isConstructor;
    List<String> modifiers;
    List<JavaParameter> parameterList;
    Integer LineCount;
    NodeList<Statement> statements;

    public JavaMethod(String returnType, String name,Boolean b, List<String> modifiers, List<JavaParameter> parameterList,Integer lc) {
        this.returnType = returnType;
        this.name = name;
        this.isConstructor = b;
        this.modifiers = modifiers;
        this.parameterList = parameterList;
        this.LineCount = lc;
        this.statements = new NodeList<Statement>();
    }

    public String getReturnType() {
        return returnType;
    }

    public void setReturnType(String returnType) {
        this.returnType = returnType;
    }

    public Integer getLineCount() {
        return LineCount;
    }

    public NodeList<Statement> getStatements() {
        return statements;
    }

    public void setStatements(NodeList<Statement> statements) {
        this.statements = statements;
    }

    public void setLineCount(Integer lineCount) {
        LineCount = lineCount;
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
