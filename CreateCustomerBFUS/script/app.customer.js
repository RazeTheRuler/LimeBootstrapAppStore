/**
	This file contains code that creates a Customer object that is used in app.js.
*/

var Customer = function(fieldMappings, rec) {
	var self = this;
	self.fieldMappings = fieldMappings;
	self.rec = rec;

	self.getCustomerId = function(customerIdFieldName) {
		return window.external.ActiveInspector.Controls.GetValue(customerIdFieldName);
	}

	self.getCustomerCode = function(customerCodeFieldName) {
		return window.external.ActiveInspector.Controls.GetValue(customerCodeFieldName);
	}

	/**
		Returns true if the customer is eligible for sending to BFUS.
		Since it is not mandatory to define any rules in the config for the app the default of this function is true.
	*/
	self.eligibleForBFUSSending = function(eligibleForBFUSSending) {
		if (eligibleForBFUSSending !== undefined) {
	        return lbs.common.executeVba('app_CreateCustomerBFUS.isEligibleForSendingToBFUS,' + lbs.activeInspector.ID + ','
	                                        + eligibleForBFUSSending.limeField, + ','
	                                        + eligibleForBFUSSending.validIdstrings);
	    }
	    else {
	        return true;
	    }
	}

	/**
		Returns false if the customer is modified and otherwise true.
	*/
	self.isRecordSaved = function() {
		return lbs.common.executeVba('app_CreateCustomerBFUS.isRecordSaved,' + lbs.activeInspector.ID);
	}

	/**
        Returns true if the customer is already integrated with BFUS and otherwise false.
    */
    self.isIntegratedWithBFUS = function(customerIdFieldName) {
        return (self.getCustomerId(customerIdFieldName) !== '');
    }

	/**
	    Returns a customer object to send when creating a new customer in BFUS.
	*/
	self.createCustomerJSON = function(suppressPinCodeWarning, suppressAddressWarning) {
	    var c = this;
	    var exp = '';
	    c.Header = {};
	    c.Header.ExternalId = lbs.activeInspector.Record.ID;
	    c.Header.SuppressPinCodeWarning = suppressPinCodeWarning;
	    c.Header.SuppressAddressWarning = suppressAddressWarning;
	    
	    // Build string with Javascript code to make configurable field mappings possible.
	    c.Customer = {};
	    c.Customer.IsProtectedIdentity = false;
	    exp = exp + 'c.Customer.IsBusinessCustomer = (self.rec.' + self.fieldMappings.IsBusinessCustomer + '.value === ' + self.fieldMappings.IsBusinessCustomerLIMEOptionId + ');\n';
	    exp = exp + 'c.Customer.FirstName = self.rec.' + self.fieldMappings.FirstName + '.text;\n';
	    exp = exp + 'if (!c.Customer.IsBusinessCustomer) { c.Customer.LastName = self.rec.' + self.fieldMappings.LastName + '.text; }\n';
	    exp = exp + 'if (!c.Customer.IsBusinessCustomer) { c.Customer.PinCode = self.rec.' + self.fieldMappings.PinCode + '.text; }\n';
	    exp = exp + 'if (c.Customer.IsBusinessCustomer) { c.Customer.CompanyCode = self.rec.' + self.fieldMappings.CompanyCode + '.text; }\n';
	    
	    c.Customer.EmailInformation = {};
	    exp = exp + 'c.Customer.EmailInformation.AcceptEMail = (self.rec.' + self.fieldMappings.AcceptEMail + '.value === 1);\n';
	    if (self.fieldMappings.Email1 !== '') {
	        exp = exp + 'c.Customer.EmailInformation.EMail1 = self.rec.' + self.fieldMappings.EMail1 + '.text;\n';
	    }
	    if (self.fieldMappings.Email2 !== '') {
	        exp = exp + 'c.Customer.EmailInformation.EMail2 = self.rec.' + self.fieldMappings.EMail2 + '.text;\n';
	    }
	    if (self.fieldMappings.Email3 !== '') {
	        exp = exp + 'c.Customer.EmailInformation.EMail3 = self.rec.' + self.fieldMappings.EMail3 + '.text;\n';
	    }
	    
	    c.Customer.SMSInformation = {};
	    exp = exp + 'c.Customer.SMSInformation.AcceptSMS = (self.rec.' + self.fieldMappings.AcceptSMS + '.value === 1);\n';
	    c.Customer.Phones = [];
	    $.each(self.fieldMappings.Phones, function (index, obj) {
	        exp = exp + 'c.Customer.Phones.push({'
	        exp = exp + 'PhoneTypeId : ' + obj.PhoneTypeId + ','
	        exp = exp + 'Number : self.rec.' + obj.Number + '.text'
	        exp = exp + '});\n'
	    });
	    
	    c.Customer.Addresses = [];
	    $.each(self.fieldMappings.Addresses, function (index, obj) {
	        exp = exp + 'c.Customer.Addresses.push({'
	        exp = exp + 'AddressTypeId : ' + obj.AddressTypeId + ','
	        exp = exp + 'StreetName : self.rec.' + obj.StreetName + '.text,'
	        exp = exp + 'StreetQualifier : self.rec.' + obj.StreetQualifier + '.text,'
	        exp = exp + 'StreetNumberSuffix : self.rec.' + obj.StreetNumberSuffix + '.text,'
	        exp = exp + 'PostOfficeCode : self.rec.' + obj.PostOfficeCode + '.text,'
	        exp = exp + 'City : self.rec.' + obj.City + '.text,'
	        exp = exp + 'CountryCode : self.rec.' + obj.CountryCode + '.text,'
	        exp = exp + 'ApartmentNumber : self.rec.' + obj.ApartmentNumber + '.text,'
	        exp = exp + 'FloorNumber : self.rec.' + obj.FloorNumber + '.text,'
	        exp = exp + '});\n'
	    });
	    
	    // Add all properties
	    eval(exp);
	    
	    return c;
	}

	/**
	    Returns a customer object to send when updating a customer in BFUS.
	*/
	self.updateCustomerJSON = function(suppressPinCodeWarning, suppressAddressWarning) {
	    var c = this;
	    var exp = '';
	    
	    c.Header = {};
	    c.Header.ExternalId = lbs.activeInspector.Record.ID;
	    
	    // Build string with Javascript code to make configurable field mappings possible.
	    c.Customer = {};
	    c.Customer.IsProtectedIdentity = false;
	    exp = exp + 'c.Customer.CustomerCode = self.getCustomerCode(\'' + self.fieldMappings.CustomerCode + '\');\n';
	    exp = exp + 'c.Customer.CustomerId = self.getCustomerId(\'' + self.fieldMappings.CustomerId + '\');\n';
	    exp = exp + 'c.Customer.FirstName = self.rec.' + self.fieldMappings.FirstName + '.text;\n';
	    exp = exp + 'if (self.rec.' + self.fieldMappings.IsBusinessCustomer + '.value !== ' + self.fieldMappings.IsBusinessCustomerLIMEOptionId + ') { c.Customer.LastName = self.rec.' + self.fieldMappings.LastName + '.text; }\n';
	    
	    c.Customer.EmailInformation = {};
	    exp = exp + 'c.Customer.EmailInformation.AcceptEMail = (self.rec.' + self.fieldMappings.AcceptEMail + '.value === 1);\n';
	    if (self.fieldMappings.Email1 !== '') {
	        exp = exp + 'c.Customer.EmailInformation.EMail1 = self.rec.' + self.fieldMappings.EMail1 + '.text;\n';
	    }
	    if (self.fieldMappings.Email2 !== '') {
	        exp = exp + 'c.Customer.EmailInformation.EMail2 = self.rec.' + self.fieldMappings.EMail2 + '.text;\n';
	    }
	    if (self.fieldMappings.Email3 !== '') {
	        exp = exp + 'c.Customer.EmailInformation.EMail3 = self.rec.' + self.fieldMappings.EMail3 + '.text;\n';
	    }

	    c.Customer.SMSInformation = {};
	    exp = exp + 'c.Customer.SMSInformation.AcceptSMS = (self.rec.' + self.fieldMappings.AcceptSMS + '.value === 1);\n';
	    c.Customer.Phones = [];
	    $.each(self.fieldMappings.Phones, function (index, obj) {
	        exp = exp + 'c.Customer.Phones.push({'
	        	//##TODO: Skicka med PhoneId?
	        exp = exp + 'PhoneTypeId : ' + obj.PhoneTypeId + ','
	        exp = exp + 'Number : self.rec.' + obj.Number + '.text'
	        	//##TODO: Skicka med DeleteObject?
	        exp = exp + '});\n'
	    });

	    // Add all properties
	    eval(exp);

	    return c;
	}
}