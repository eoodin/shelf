# Philosophy

## document centric

product development managed with a set of readable, shippable and runnable documents.

### readable

Use limited version of rich format document.

### Shippable

Can be export to other media like PDF at any time.

### Runnable
 
Tests, checks, progress are embedded into documents, like what in fitness.

# Design

## Model

### multi-tenant

This app is supposed to be multi-tenant capable, initial thought of tenant data isolation can be done by add-on
solution. Thus it requires nothing special for tenant before tenant feature introduced, which is supposed to be done
in later phase. 

### users

Basic user information is shared within a tenant, that means those at least:
* all users have the same authentication entry
* user is able to involve in different projects

### projects

project is the central model, or root model in DDD.

### backlog

backlog represents requirements.

### story

represents the doable parts directly from requirement.


# Key topics

## relationship between requirement and user document

Rough thought would be user document is extracted from requirement, it is parts in requirement where user aspect
is stated. 


## Authentication

Both internal and external authentication is supported. When external authentication configured, it will be used first.

## Authorization

Ideas:

- Basic: user - group - role - api authentication
- Project: ACL
